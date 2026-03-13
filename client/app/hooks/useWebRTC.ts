import { useState, useRef, useCallback, useEffect } from 'react';
import {
  createPeerConnection,
  addIceCandidate,
  createOffer,
  createAnswer,
  replaceTrack,
} from '@/app/utils/webrtc';
import { useSocket } from './useSocket';
import { User, Message } from '@/app/types';

export interface MeetingEventPopup {
  id: string;
  type: 'direct-message' | 'group-message' | 'join-request' | 'participant-joined' | 'participant-left';
  title: string;
  description: string;
  timestamp: number;
  userId?: string;
}

interface WebRTCState {
  users: Map<string, User>;
  messages: Message[];
  localUserId: string;
  roomId: string;
}

export const useWebRTC = (
  localUserId: string,
  roomId: string,
  name: string,
  role: string,
  localStream: MediaStream | null,
  screenStream: MediaStream | null,
  options?: {
    onForceStopScreen?: () => void;
    isHost?: boolean;
    initialStatus?: 'JOINED' | 'WAITING' | 'INVITED';
    onAdmitted?: () => void;
    onRejected?: () => void;
    onHostMuteAudio?: () => void;
    onHostMuteVideo?: () => void;
    onHostDrop?: () => void;
    onMeetingEnded?: (endedBy: string) => void;
    onAdmitParticipant?: (targetUserId: string) => void;
    onRejectParticipant?: (targetUserId: string) => void;
  }
) => {
  const [waitingUsers, setWaitingUsers] = useState<User[]>([]);
  const [eventPopups, setEventPopups] = useState<MeetingEventPopup[]>([]);
  const [admissionStatus, setAdmissionStatus] = useState<'IDLE' | 'WAITING' | 'ADMITTED' | 'REJECTED'>(
    options?.initialStatus === 'WAITING' ? 'WAITING' : 'IDLE'
  );

  const [state, setState] = useState<WebRTCState>({
    users: new Map(),
    messages: [],
    localUserId,
    roomId,
  });

  const usersRef = useRef<Map<string, User>>(new Map());
  useEffect(() => {
    usersRef.current = state.users;
  }, [state.users]);

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<
    Map<string, { camera?: MediaStream; screen?: MediaStream }>
  >(new Map());
  const localStreamRef = useRef<MediaStream | null>(localStream);
  const screenStreamRef = useRef<MediaStream | null>(screenStream);
  const isHostRef = useRef(options?.isHost);
  const [finalText, setFinalText] = useState("");
  const [partialText, setPartialText] = useState("");
  const transcriptionSocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const isStartingRef = useRef(false);
  const turnsRef = useRef<Record<number, string>>({});
  const [whiteboardData, setWhiteboardData] = useState<{ data: any; userId: string; timestamp: number } | null>(null);


  useEffect(() => {
    isHostRef.current = options?.isHost;
  }, [options?.isHost]);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    screenStreamRef.current = screenStream;
  }, [screenStream]);

  const getDisplayName = useCallback((compositeId: string) => {
    return compositeId.split(':')[0] || compositeId;
  }, []);

  const pushEventPopup = useCallback((payload: Omit<MeetingEventPopup, 'id' | 'timestamp'>) => {
    const popup: MeetingEventPopup = {
      ...payload,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
    };

    setEventPopups(prev => [popup, ...prev].slice(0, 5));
  }, []);

  const addRemoteStream = useCallback(
    (
      userId: string,
      stream: MediaStream,
      type: 'camera' | 'screen'
    ) => {
      const existing = remoteStreamsRef.current.get(userId) || {};

      if (type === 'camera') existing.camera = stream;
      if (type === 'screen') existing.screen = stream;

      remoteStreamsRef.current.set(userId, existing);

      setState(prev => {
        const users = new Map(prev.users);
        const user = users.get(userId) || {
          id: userId,
          isAudioMuted: false,
          isVideoOff: false,
          isLocal: false,
          isScreenSharing: false,
          isHandRaised: false,
          name: name,
          role: role,
        };

        user.stream = existing.camera;
        user.screenStream = existing.screen;

        users.set(userId, user);
        return { ...prev, users };
      });
    },
    []
  );

  const removeUser = useCallback((userId: string) => {
    peerConnectionsRef.current.get(userId)?.close();
    peerConnectionsRef.current.delete(userId);
    remoteStreamsRef.current.delete(userId);

    setState(prev => {
      const users = new Map(prev.users);
      users.delete(userId);
      return { ...prev, users };
    });
  }, []);

  const {
    connect,
    disconnect,
    sendSignal,
    sendChatMessage,
    sendUserAction,
    sendJoinResponse,
    sendMeetingEnded,
    joinRoom,
    isConnected,
    sendWhiteboardData
  } = useSocket({
    onConnected: () => {
      const waitingFlag = options?.isHost ? false : options?.initialStatus === 'WAITING';
      joinRoom(roomId, localUserId, name, role, options?.isHost, waitingFlag);
    },

    onUserConnected: ({ userId, name: connectedName, role: connectedRole }) => {
      if (userId !== localUserId) {

        setState(prev => {
          const users = new Map(prev.users);
          if (!users.has(userId)) {
            users.set(userId, {
              id: userId,
              name: connectedName || "Guest",
              role: connectedRole || "Participant",
              isAudioMuted: false,
              isVideoOff: false,
              isLocal: false,
              isScreenSharing: false
            });
          }
          return { ...prev, users };
        });

        pushEventPopup({
          type: 'participant-joined',
          title: 'Participant joined',
          description: `${name} joined the meeting`,
          userId,
        });

        initializePeerConnection(userId);
      }
    },

    onUserDisconnected: ({ userId }) => {
      const displayName =
        usersRef.current.get(userId)?.name ||
        getDisplayName(userId);

      if (userId !== localUserId) {
        pushEventPopup({
          type: 'participant-left',
          title: 'Participant left',
          description: `${displayName} left the meeting`,
          userId,
        });
      }
      removeUser(userId);
    },

    onExistingUsers: ({ users }) => {
      setState(prev => {
        const map = new Map(prev.users);
      
        users.forEach(user => {
          if (!user?.userId) return;
        
          map.set(user.userId, {
            id: user.userId,
            name: user.name || "Guest",
            role: user.role || "Participant",
            isAudioMuted: false,
            isVideoOff: false,
            isLocal: false,
            isScreenSharing: false,
            isHandRaised: false
          });
        
        });
      
        return { ...prev, users: map };
      });
    },

    onSignal: ({ from, signal }) => handleSignal(from, signal),

    onUserAction: ({ userId, action, value, targetUserId }) => {
      // Handle host actions targeting local user
      if (targetUserId === localUserId) {
        if (action === 'host-mute-audio') {
          options?.onHostMuteAudio?.();
        } else if (action === 'host-mute-video') {
          options?.onHostMuteVideo?.();
        } else if (action === 'host-drop-user') {
          options?.onHostDrop?.();
        }
        return;
      }

      setState(prev => {
        const users = new Map(prev.users);
        const existingUser = users.get(userId);
        if (!existingUser || existingUser.isLocal) return prev;

        const user = { ...existingUser };

        if (action === 'toggle-audio') user.isAudioMuted = value;
        if (action === 'toggle-video') user.isVideoOff = value;
        if (action === 'toggle-hand') {
          user.isHandRaised = value;
          user.handRaisedTimestamp = value ? Date.now() : undefined;
        }

        if (action === 'toggle-screen') {
          user.isScreenSharing = value;
          // When sharing stops, clear the screenStream reference to hide the tile
          if (!value) {
            user.screenStream = undefined;
            const remoteStreams = remoteStreamsRef.current.get(userId);
            if (remoteStreams) {
              remoteStreams.screen = undefined;
              remoteStreamsRef.current.set(userId, remoteStreams);
            }
          }
        }

        users.set(userId, user);
        return { ...prev, users };
      });
    },

    onChatMessage: data => {
      const senderName =
        usersRef.current.get(data.userId)?.name ||
        getDisplayName(data.userId);

      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            userId: data.userId,
            userName: senderName,
            content: data.message,
            timestamp: new Date(data.timestamp),
            isLocal: false,
            targetUserId: data.targetUserId,
            isDirect: !!data.targetUserId || !!data.isDirect,
          },
        ],
      }));

      if (data.userId !== localUserId) {
        if (data.targetUserId && data.targetUserId === localUserId) {
          pushEventPopup({
            type: 'direct-message',
            title: 'New direct message',
            description: `${senderName}: ${data.message}`,
            userId: data.userId,
          });
        } else if (!data.targetUserId) {
          pushEventPopup({
            type: 'group-message',
            title: 'New group message',
            description: `${senderName}: ${data.message}`,
            userId: data.userId,
          });
        }
      }
    },

    onForceStopScreen: () => {
      stopScreenSharing();
      if (options?.onForceStopScreen) {
        options.onForceStopScreen();
      }
    },

    onRoleUpdated: ({ userId: updatedUserId, newRole, prevHostId }) => {
      setState(prev => {
        const users = new Map(prev.users);
        const existingUser = users.get(updatedUserId);
        
        if (existingUser) {
          users.set(updatedUserId, { ...existingUser, role: newRole });
        }

        // If a new host was assigned, the old host was demoted to CO_HOST
        if (prevHostId && users.has(prevHostId)) {
          const prevHost = users.get(prevHostId)!;
          users.set(prevHostId, { ...prevHost, role: 'CO_HOST' });
        }

        return { ...prev, users };
      });

      if (updatedUserId === localUserId) {
        isHostRef.current = newRole === 'HOST';
      } else if (prevHostId === localUserId) {
        isHostRef.current = false;
      }
    },

    onJoinRequest: ({ userId, name, role }) => {
      // Allow Host and Co-host to see join requests
      const localUser = usersRef.current.get(localUserId);
      const canManageAdmissions = localUser?.role === 'HOST' || localUser?.role === 'CO_HOST';
      
      if (canManageAdmissions) {
        setWaitingUsers(prev => {
          if (prev.find(u => u.id === userId)) return prev;
          return [...prev, {
            id: userId,
            name: name ?? "Guest",
            role: role ?? "PARTICIPANT",
            isAudioMuted: false,
            isVideoOff: false,
            isLocal: false,
            isScreenSharing: false,
            isHandRaised: false,
          }];
        });

        pushEventPopup({
          type: 'join-request',
          title: 'Join request',
          description: `${name} is asking to join`,
          userId,
        });
      }
    },

    onJoinResponse: ({ approved }) => {
      if (approved) {
        setAdmissionStatus('ADMITTED');
        options?.onAdmitted?.();
      } else {
        setAdmissionStatus('REJECTED');
        options?.onRejected?.();
      }
    },

    onWaitingUsers: ({ users }) => {
      const localUser = usersRef.current.get(localUserId);
      const canManageAdmissions = localUser?.role === 'HOST' || localUser?.role === 'CO_HOST';

      if (canManageAdmissions) {
        setWaitingUsers(prev => {
          const newWaiting = [...prev];
          users.forEach(u => {
            if (!newWaiting.find(existing => existing.id === u.userId)) {
              newWaiting.push({
                id: u.userId,
                name: u.name ?? "Guest",
                role: u.role ?? "PARTICIPANT",
                isAudioMuted: false,
                isVideoOff: false,
                isLocal: false,
                isScreenSharing: false,
                isHandRaised: false,
              });
            }
          });
          return newWaiting;
        });
      }
    },

    onMeetingEnded: ({ endedBy }) => {
      options?.onMeetingEnded?.(endedBy);
    },

    onWhiteboardData: (data) => {
      setWhiteboardData(data);
    },
  });

  const onIceCandidate = useCallback(
    (candidate: RTCIceCandidate, targetUserId: string) => {
      sendSignal({
        to: targetUserId,
        from: localUserId,
        signal: { type: 'candidate', candidate: candidate.toJSON() },
      });
    },
    [localUserId, sendSignal]
  );

// const onTrack = useCallback(
//   (event: RTCTrackEvent, remoteUserId: string) => {
//     const track = event.track;
//     console.log('Track: ', event.track);
//     console.log('Trans track: ', event.transceiver.receiver);
//     const mid = event.transceiver.mid;

//     let existing =
//       remoteStreamsRef.current.get(remoteUserId) || {
//         camera: undefined,
//         screen: undefined,
//       };

//     const isScreen =
//       track.kind === 'video'
//         ? track.contentHint === 'detail'
//         : event.transceiver.receiver.track?.contentHint === 'detail';

//     if (isScreen) {
//       existing.screen = existing.screen || new MediaStream();
//       existing.screen.addTrack(track);
//     } else {
//       existing.camera = existing.camera || new MediaStream();
//       existing.camera.addTrack(track);
//     }

//     remoteStreamsRef.current.set(remoteUserId, existing);

//     setState(prev => {
//       const users = new Map(prev.users);
//       const user = users.get(remoteUserId) || {
//         id: remoteUserId,
//         isAudioMuted: false,
//         isVideoOff: false,
//         isLocal: false,
//         isScreenSharing: false,
//       };

//       user.stream = existing.camera;
//       user.screenStream = existing.screen;
//       user.isScreenSharing = !!existing.screen;

//       users.set(remoteUserId, user);
//       return { ...prev, users };
//     });
//   },
//   []
// );

  const onTrack = useCallback(
    (event: RTCTrackEvent, remoteUserId: string) => {
      const stream = event.streams?.[0];
      if (!stream) return;

      const existing = remoteStreamsRef.current.get(remoteUserId) || { camera: undefined, screen: undefined };
      const isVideoTrack = event.track.kind === 'video';
      const isAudioTrack = event.track.kind === 'audio';

      const users = state.users;
      const user = users.get(remoteUserId);

      if (isVideoTrack) {
        const isCamera = existing.camera && stream.id === existing.camera.id;
        const isScreen = existing.screen && stream.id === existing.screen.id;

        if (isCamera) {
          existing.camera = stream;
        } else if (isScreen) {
          existing.screen = stream;
        } else if (user?.isScreenSharing && existing.camera) {
          existing.screen = stream;
        } else if (!existing.camera) {
          existing.camera = stream;
        } else {
          existing.screen = stream;
        }
      } else if (isAudioTrack) {
        existing.camera = stream;
      }

      remoteStreamsRef.current.set(remoteUserId, existing);

      setState(prev => {
        const users = new Map(prev.users);
        const existingUser = users.get(remoteUserId);
        console.log("jd: ",users);
        console.log("gg: ",existingUser);

        const user = existingUser ? { ...existingUser } : {
          id: remoteUserId,
          name: name,
          role: role,
          isAudioMuted: false,
          isVideoOff: false,
          isLocal: false,
          isScreenSharing: false,
          isHandRaised: false
        };

        user.stream = existing.camera;
        user.screenStream = existing.screen;

        user.isScreenSharing = user.isScreenSharing || !!existing.screen;

        users.set(remoteUserId, user);
        return { ...prev, users };
      });
    },
    [ state.users]
  );

  // const onTrack = useCallback(
  //   (event: RTCTrackEvent, remoteUserId: string) => {
  //     let stream = event.streams?.[0];
  //     console.log("events: ",event.streams);
  //     console.log("Checking Checking Checking Checking Checking Checking Checking Checking ")
  //     // if (!stream) return;
  //     if (!stream) {
  //       stream = new MediaStream();
  //       stream.addTrack(event.track);
  //     }

  //     const existing =
  //       remoteStreamsRef.current.get(remoteUserId) || {
  //         camera: undefined,
  //         screen: undefined,
  //       };

  //     const currentUser = state.users.get(remoteUserId);
  //     const isMarkedScreenSharing = !!currentUser?.isScreenSharing;

  //     if (event.track.kind === 'audio') {
  //       if (!existing.camera) {
  //         existing.camera = stream;
  //       }
  //     }

  //     if (event.track.kind === 'video') {
  //       const isSameAsCamera = existing.camera?.id === stream.id;

  //       if (!existing.camera || isSameAsCamera) {
  //         existing.camera = stream;
  //       } else if (isMarkedScreenSharing) {
  //         existing.screen = stream;
  //       } else {
  //         existing.camera = stream;
  //       }
  //     }

  //     remoteStreamsRef.current.set(remoteUserId, existing);

  //     setState(prev => {
  //       const users = new Map(prev.users);
  //       const existingUser = users.get(remoteUserId);

  //       const updatedUser = existingUser
  //         ? { ...existingUser }
  //         : {
  //             id: remoteUserId,
  //             isAudioMuted: false,
  //             isVideoOff: false,
  //             isLocal: false,
  //             isScreenSharing: false,
  //           };

  //       updatedUser.stream = existing.camera;
  //       updatedUser.screenStream = existing.screen;
  //       updatedUser.isScreenSharing = updatedUser.isScreenSharing && !!existing.screen;

  //       users.set(remoteUserId, updatedUser);
  //       return { ...prev, users };
  //     });
  //   },
  //   [state.users]
  // );

  // const onTrack = useCallback(
  //   (event: RTCTrackEvent, remoteUserId: string) => {
  //     const track = event.track;
    
  //     let existing =
  //       remoteStreamsRef.current.get(remoteUserId) || {
  //         camera: undefined,
  //         screen: undefined,
  //       };
      
  //     // Fresh stream per track
  //     const newStream = new MediaStream([track]);
      
  //     if (track.kind === 'video') {
  //       if (track.contentHint === 'detail') {
  //         // This is screen share
  //         existing.screen = newStream;
  //       } else {
  //         // This is camera
  //         existing.camera = newStream;
  //       }
  //     }
    
  //     if (track.kind === 'audio') {
  //       if (!existing.camera) {
  //         existing.camera = new MediaStream();
  //       }
  //       existing.camera.addTrack(track);
  //     }
    
  //     remoteStreamsRef.current.set(remoteUserId, existing);
    
  //     setState(prev => {
  //       const users = new Map(prev.users);
  //       const user = users.get(remoteUserId) || {
  //         id: remoteUserId,
  //         isAudioMuted: false,
  //         isVideoOff: false,
  //         isLocal: false,
  //         isScreenSharing: false,
  //       };
      
  //       user.stream = existing.camera;
  //       user.screenStream = existing.screen;
  //       user.isScreenSharing = !!existing.screen;
      
  //       users.set(remoteUserId, user);
  //       return { ...prev, users };
  //     });
  //   },
  //   []
  // );

  const getOrCreatePC = useCallback(
    (remoteUserId: string) => {
      let pc = peerConnectionsRef.current.get(remoteUserId);

      if (!pc) {
        pc = createPeerConnection(
          localUserId,
          remoteUserId,
          null,
          onIceCandidate,
          onTrack
        );

        localStreamRef.current?.getTracks().forEach(track => {
          pc!.addTrack(track, localStreamRef.current!);
        });

        screenStreamRef.current?.getTracks().forEach(track => {
          pc!.addTrack(track, screenStreamRef.current!);
        });

        peerConnectionsRef.current.set(remoteUserId, pc);
      }

      return pc;
    },
    [localUserId, onIceCandidate, onTrack]
  );

  const initializePeerConnection = useCallback(
    async (remoteUserId: string) => {
      const pc = getOrCreatePC(remoteUserId);

      try {
        const offer = await createOffer(pc);
        sendSignal({
          to: remoteUserId,
          from: localUserId,
          signal: { type: 'offer', sdp: offer.sdp },
        });
      } catch (err) {
        console.error('Error creating offer:', err);
      }
    },
    [getOrCreatePC, localUserId, sendSignal]
  );

  const handleSignal = useCallback(
    async (from: string, signal: any) => {
      const pc = getOrCreatePC(from);

      try {
        if (signal.type === 'offer') {
          if (pc.signalingState !== 'stable') {
            console.warn(
              'Offer received in non-stable state, ignoring'
            );
            return;
          }

          const answer = await createAnswer(pc, signal);
          sendSignal({
            to: from,
            from: localUserId,
            signal: { type: 'answer', sdp: answer.sdp },
          });
        }
        else if (signal.type === 'answer') {
          if (pc.signalingState !== 'have-local-offer') {
            console.warn(
              'Ignoring answer in state:',
              pc.signalingState
            );
            return;
          }

          await pc.setRemoteDescription(
            new RTCSessionDescription(signal)
          );
        }
        else if (signal.type === 'candidate') {
          await addIceCandidate(pc, signal.candidate);
        }
      } catch (err) {
        console.error('Error handling signal:', err);
      }
    },
    [getOrCreatePC, localUserId]
  );

  const setUsersLocalMedia = useCallback(
    (action: 'toggle-audio' | 'toggle-video' | 'toggle-screen' | 'toggle-hand', value: boolean) => {
      setState(prev => {
        const users = new Map(prev.users);
        const existingUser = users.get(localUserId);
        if (!existingUser) return prev;

        const user = { ...existingUser };

        if (action === 'toggle-audio') user.isAudioMuted = value;
        if (action === 'toggle-video') user.isVideoOff = value;
        if (action === 'toggle-screen') user.isScreenSharing = value;
        if(action === 'toggle-hand') user.isHandRaised=value;

        users.set(localUserId, user);
        return { ...prev, users };
      });
    },
    [localUserId]
  );

  const getAssemblyToken = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/assembly/token`, {
      method: "GET",
    });

    const data = await response.json();
    return data.token;
  };

  const handleSendWhiteboardData = useCallback((data: any) => {
    sendWhiteboardData(roomId, localUserId, data);
  }, [roomId, localUserId, sendWhiteboardData]);

  const createMixedAudioStream = (audioContext: AudioContext) => {
    const destination = audioContext.createMediaStreamDestination();

    remoteStreamsRef.current.forEach((streams) => {
      streams.camera?.getAudioTracks().forEach(track => {
        const source = audioContext.createMediaStreamSource(
          new MediaStream([track])
        );
        source.connect(destination);
      });
    
      streams.screen?.getAudioTracks().forEach(track => {
        const source = audioContext.createMediaStreamSource(
          new MediaStream([track])
        );
        source.connect(destination);
      });
    });

    localStreamRef.current?.getAudioTracks().forEach(track => {
      const source = audioContext.createMediaStreamSource(
        new MediaStream([track])
      );
      source.connect(destination);
    });

    return destination.stream;
  };

  const downsampleBuffer = (
    buffer: Float32Array,
    sampleRate: number
  ) => {
    const targetRate = 16000;
    const ratio = sampleRate / targetRate;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Int16Array(newLength);

    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
      let accum = 0;
      let count = 0;

      for (let i = offsetBuffer; i < nextOffsetBuffer; i++) {
        accum += buffer[i];
        count++;
      }

      const sample = accum / count;
      result[offsetResult] = Math.max(-1, Math.min(1, sample)) * 0x7fff;

      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }

    return result;
  };

  const connectToAssembly = async () => {
    const token = await getAssemblyToken();

    return new Promise<void>((resolve, reject) => {
      transcriptionSocketRef.current = new WebSocket(
        `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&token=${token}`
      );

      transcriptionSocketRef.current.onopen = () => {
        console.log("WebSocket connected");
        resolve();
      };

      transcriptionSocketRef.current.onerror = reject;

      transcriptionSocketRef.current.onclose = (event) => {
        console.log("AssemblyAI connection closed", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
        transcriptionSocketRef.current = null;
      };

      transcriptionSocketRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
      
        console.log("Transcription message:", message);
      
        if (message.type !== "Turn") return;
      
        const { transcript, end_of_turn } = message;
      
        if (!transcript) return;
      
        if (end_of_turn) {
          // When user finishes speaking → move to final
          setFinalText((prev) => {
            const updated = prev ? prev + " " + transcript : transcript;
            return updated;
          });
        
          setPartialText(""); // clear live text
        } else {
          // While user is speaking → update live partial
          setPartialText(transcript);
        }
      };
    });
  };

  const startCaptions = async () => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;

    try{
      if (transcriptionSocketRef.current || audioContextRef.current) return;
      const audioContext = new AudioContext();
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
      await audioContext.audioWorklet.addModule('/processor.js');

      const stream = createMixedAudioStream(audioContext);

      await connectToAssembly();
      if (!transcriptionSocketRef.current) return;

      const source = audioContext.createMediaStreamSource(stream);

      const workletNode = new AudioWorkletNode(
        audioContext,
        'pcm-processor'
      );
    
      source.connect(workletNode);
      const gain = audioContext.createGain();
      gain.gain.value = 0; // silent
      workletNode.connect(gain);
      gain.connect(audioContext.destination);
      let pcmBufferQueue: Int16Array[] = [];
      let bufferedSamples = 0;

      const MIN_SAMPLES = 1600;

      workletNode.port.onmessage = (event) => {
        const float32Data = event.data;
      
        const downsampled = downsampleBuffer(
          float32Data,
          audioContext.sampleRate
        );
      
        pcmBufferQueue.push(downsampled);
        bufferedSamples += downsampled.length;
      
        if (bufferedSamples >= MIN_SAMPLES) {
          const merged = new Int16Array(bufferedSamples);
          let offset = 0;
        
          for (const chunk of pcmBufferQueue) {
            merged.set(chunk, offset);
            offset += chunk.length;
          }
        
          if (
            transcriptionSocketRef.current &&
            transcriptionSocketRef.current.readyState === WebSocket.OPEN
          ) {
            transcriptionSocketRef.current.send(merged.buffer);
          }
        
          pcmBufferQueue = [];
          bufferedSamples = 0;
        }
      };
    
      audioContextRef.current = audioContext;
      workletNodeRef.current = workletNode;
    }
    finally{
      isStartingRef.current = false;
    }
  };

  const stopCaptions = () => {
    if (!transcriptionSocketRef.current) return;
  
    transcriptionSocketRef.current.send(
      JSON.stringify({ terminate_session: true })
    );
  
    transcriptionSocketRef.current.close();
    transcriptionSocketRef.current = null;
  
    workletNodeRef.current?.disconnect();
    audioContextRef.current?.close();
  
    audioContextRef.current = null;
    workletNodeRef.current = null;
  
    setFinalText('');
    setPartialText('');
  };

  const stopScreenSharing = useCallback(async () => {
    const screen = screenStreamRef.current;
    if (!screen) return;

    screen.getTracks().forEach(track => track.stop());
    screenStreamRef.current = null;

    // Remove screen tracks from all peer connections and RENEGOTIATE
    for (const [remoteUserId, pc] of peerConnectionsRef.current.entries()) {
      const senders = pc.getSenders();
      let trackRemoved = false;

      senders.forEach(sender => {
        // Only remove tracks that belongs to the screen stream
        if (sender.track && screen.getTracks().some(t => t.id === sender.track?.id)) {
          pc.removeTrack(sender);
          trackRemoved = true;
        }
      });

      if (trackRemoved) {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignal({
            to: remoteUserId,
            from: localUserId,
            signal: offer,
          });
        } catch (error) {
          console.error(`Error renegotiating after stopping screen share with ${remoteUserId}:`, error);
        }
      }
    }

    setUsersLocalMedia('toggle-screen', false);
    sendUserAction(roomId, localUserId, 'toggle-screen', false);
  }, [localUserId, roomId, sendSignal, sendUserAction, setUsersLocalMedia]);

  useEffect(() => {
    if (localUserId && roomId) {
      if (options?.isHost === undefined) return;
      connect(roomId, localUserId);
    }

    return () => {
      stopCaptions();
      disconnect();
      peerConnectionsRef.current.forEach(pc => {
        pc.getSenders().forEach(sender => {
          if (sender.track) sender.track.stop();
        });
        pc.close();
      });
      peerConnectionsRef.current.clear();
      remoteStreamsRef.current.clear();
    };
  }, [localUserId, roomId, connect, disconnect, options?.isHost]);

  // useEffect(() => {
  //   if (!transcriptionSocketRef.current || !audioContextRef.current) return;

  //   stopCaptions();
  //   startCaptions();
  // }, [state.users]);

  useEffect(() => {
    if (!localStream) return;

    peerConnectionsRef.current.forEach(pc => {
      replaceTrack(pc, localStream);
    });
  }, [localStream]);

  // Handle screen stream changes (addition and renegotiation)
  useEffect(() => {
    if (!screenStream) return;

    const handleScreenShare = async () => {
      for (const [remoteUserId, pc] of peerConnectionsRef.current.entries()) {
        const senders = pc.getSenders();
        let added = false;

        screenStream.getTracks().forEach(track => {
          const alreadySending = senders.find(s => s.track?.id === track.id);
        
          if (!alreadySending) {
            if (track.kind === 'video') {
              track.contentHint = 'detail';
            }
          
            pc.addTrack(track, screenStream);
            added = true;
          }
        });

        if (added) {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            sendSignal({
              to: remoteUserId,
              from: localUserId,
              signal: offer,
            });
          } catch (error) {
            console.error(`Error renegotiating screen share with ${remoteUserId}:`, error);
          }
        }
      }
    };

    handleScreenShare();
  }, [screenStream, localUserId, sendSignal]);

  useEffect(() => {
    setState(prev => {
      const users = new Map(prev.users);
      const existing = users.get(localUserId);
    
      users.set(localUserId, {
        id: localUserId,
        name: name,
        role: role,
        stream: localStream || existing?.stream,
        screenStream: screenStream || undefined,
        isAudioMuted: existing?.isAudioMuted ?? false,
        isVideoOff: existing?.isVideoOff ?? false,
        isLocal: true,
        isScreenSharing: !!screenStream,
        isHandRaised: existing?.isHandRaised ?? false,
        handRaisedTimestamp: existing?.handRaisedTimestamp,
      });
    
      return { ...prev, users };
    });
  }, [localStream, screenStream, localUserId, name, role]);

  return {
    users: Array.from(state.users.values()),
    messages: state.messages,
    sendChatMessage: (content: string, targetUserId?: string) => {
      sendChatMessage(roomId, localUserId, content, targetUserId);
      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            userId: localUserId,
            content,
            timestamp: new Date(),
            isLocal: true,
            targetUserId,
            isDirect: !!targetUserId,
          },
        ],
      }));
    },
    sendUserAction,
    endMeetingForAll: () => {
      sendMeetingEnded(roomId, localUserId);
    },
    setUsersLocalMedia,
    admitParticipant: (targetUserId: string) => {
      sendJoinResponse(roomId, targetUserId, true);
      setWaitingUsers(prev => prev.filter(u => u.id !== targetUserId));
      options?.onAdmitParticipant?.(targetUserId);
    },
    rejectParticipant: (targetUserId: string) => {
      sendJoinResponse(roomId, targetUserId, false);
      setWaitingUsers(prev => prev.filter(u => u.id !== targetUserId));
      options?.onRejectParticipant?.(targetUserId);
    },
    waitingUsers,
    admissionStatus,
    isConnected,
    startCaptions,
    stopCaptions,
    partialText,
    finalText,
    eventPopups,
    dismissEventPopup: (popupId: string) => {
      setEventPopups(prev => prev.filter(popup => popup.id !== popupId));
    },
    whiteboardData,
    sendWhiteboardData: handleSendWhiteboardData,
    sendMeetingEnded
  };
};
