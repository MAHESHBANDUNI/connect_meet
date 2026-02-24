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

interface WebRTCState {
  users: Map<string, User>;
  messages: Message[];
  localUserId: string;
  roomId: string;
}

export const useWebRTC = (
  localUserId: string,
  roomId: string,
  localStream: MediaStream | null,
  screenStream: MediaStream | null,
  options?: {
    onForceStopScreen?: () => void;
    isHost?: boolean;
    initialStatus?: 'JOINED' | 'WAITING' | 'INVITED';
    onAdmitted?: () => void;
    onRejected?: () => void;
  }
) => {
  const [waitingUsers, setWaitingUsers] = useState<User[]>([]);
  const [admissionStatus, setAdmissionStatus] = useState<'IDLE' | 'WAITING' | 'ADMITTED' | 'REJECTED'>(
    options?.initialStatus === 'WAITING' ? 'WAITING' : 'IDLE'
  );

  const [state, setState] = useState<WebRTCState>({
    users: new Map(),
    messages: [],
    localUserId,
    roomId,
  });

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<
    Map<string, { camera?: MediaStream; screen?: MediaStream }>
  >(new Map());
  const localStreamRef = useRef<MediaStream | null>(localStream);
  const screenStreamRef = useRef<MediaStream | null>(screenStream);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    screenStreamRef.current = screenStream;
  }, [screenStream]);

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
    joinRoom,
  } = useSocket({
    onConnected: () => {
      joinRoom(roomId, localUserId, options?.isHost, options?.initialStatus === 'WAITING');
    },

    onUserConnected: ({ userId }) => {
      if (userId !== localUserId) {
        setState(prev => {
          const users = new Map(prev.users);
          if (!users.has(userId)) {
            users.set(userId, {
              id: userId,
              isAudioMuted: false,
              isVideoOff: false,
              isLocal: false,
              isScreenSharing: false
            });
          }
          return { ...prev, users };
        });

        initializePeerConnection(userId);
      }
    },

    onUserDisconnected: ({ userId }) => removeUser(userId),

    onExistingUsers: ({ users }) => {
      setState(prev => {
        const map = new Map(prev.users);
        users.forEach(userId => {
          if (!map.has(userId)) {
            map.set(userId, {
              id: userId,
              isAudioMuted: false,
              isVideoOff: false,
              isLocal: false,
              isScreenSharing: false
            });
          }
        });
        return { ...prev, users: map };
      });
    },

    onSignal: ({ from, signal }) => handleSignal(from, signal),

    onUserAction: ({ userId, action, value }) => {
      setState(prev => {
        const users = new Map(prev.users);
        const existingUser = users.get(userId);
        if (!existingUser || existingUser.isLocal) return prev;

        const user = { ...existingUser };

        if (action === 'toggle-audio') user.isAudioMuted = value;
        if (action === 'toggle-video') user.isVideoOff = value;
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
      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            userId: data.userId,
            content: data.message,
            timestamp: new Date(data.timestamp),
            isLocal: false,
          },
        ],
      }));
    },

    onForceStopScreen: () => {
      stopScreenSharing();
      if (options?.onForceStopScreen) {
        options.onForceStopScreen();
      }
    },

    onJoinRequest: ({ userId }) => {
      if (options?.isHost) {
        setWaitingUsers(prev => {
          if (prev.find(u => u.id === userId)) return prev;
          return [...prev, {
            id: userId,
            isAudioMuted: false,
            isVideoOff: false,
            isLocal: false,
            isScreenSharing: false,
            name: userId.split(':')[0]
          }];
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

  const onTrack = useCallback(
    (event: RTCTrackEvent, remoteUserId: string) => {
      const stream = event.streams?.[0];
      if (!stream) return;

      const existing = remoteStreamsRef.current.get(remoteUserId) || { camera: undefined, screen: undefined };
      const isVideoTrack = event.track.kind === 'video';
      const isAudioTrack = event.track.kind === 'audio';

      // Use the current state to help identify the track
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

        const user = existingUser ? { ...existingUser } : {
          id: remoteUserId,
          isAudioMuted: false,
          isVideoOff: false,
          isLocal: false,
          isScreenSharing: false,
        };

        user.stream = existing.camera;
        user.screenStream = existing.screen;

        // If we are getting a track and we know they are screen sharing, 
        // OR we have a second stream, mark as screen sharing
        user.isScreenSharing = user.isScreenSharing || !!existing.screen;

        users.set(remoteUserId, user);
        return { ...prev, users };
      });
    },
    []
  );

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
    [getOrCreatePC, localUserId]
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
    (action: 'toggle-audio' | 'toggle-video' | 'toggle-screen', value: boolean) => {
      setState(prev => {
        const users = new Map(prev.users);
        const existingUser = users.get(localUserId);
        if (!existingUser) return prev;

        const user = { ...existingUser };

        if (action === 'toggle-audio') user.isAudioMuted = value;
        if (action === 'toggle-video') user.isVideoOff = value;
        if (action === 'toggle-screen') user.isScreenSharing = value;

        users.set(localUserId, user);
        return { ...prev, users };
      });
    },
    [localUserId]
  );

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
      connect(roomId, localUserId);
    }

    return () => {
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
  }, [localUserId, roomId, connect, disconnect]);

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

      // We should only update if we actually have a localStream or if we are in the middle of a call
      if (!localStream && !existing) return prev;

      users.set(localUserId, {
        id: localUserId,
        name: localUserId,
        stream: localStream || existing?.stream,
        screenStream: screenStream || undefined,
        isAudioMuted: existing?.isAudioMuted ?? false,
        isVideoOff: existing?.isVideoOff ?? false,
        isLocal: true,
        isScreenSharing: !!screenStream,
      });

      return { ...prev, users };
    });
  }, [localStream, screenStream, localUserId]);

  return {
    users: Array.from(state.users.values()),
    messages: state.messages,
    sendChatMessage: (content: string) => {
      sendChatMessage(roomId, localUserId, content);
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
          },
        ],
      }));
    },
    sendUserAction,
    setUsersLocalMedia,
    admitParticipant: (targetUserId: string) => {
      sendJoinResponse(roomId, targetUserId, true);
      setWaitingUsers(prev => prev.filter(u => u.id !== targetUserId));
    },
    rejectParticipant: (targetUserId: string) => {
      sendJoinResponse(roomId, targetUserId, false);
      setWaitingUsers(prev => prev.filter(u => u.id !== targetUserId));
    },
    waitingUsers,
    admissionStatus,
    isConnected: true,
  };
};
