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
  localStream: MediaStream | null
) => {
  const [state, setState] = useState<WebRTCState>({
    users: new Map(),
    messages: [],
    localUserId,
    roomId,
  });

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(localStream);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  /* ---------------- Remote stream handling ---------------- */

  const addRemoteStream = useCallback((userId: string, stream: MediaStream) => {
    remoteStreamsRef.current.set(userId, stream);

    setState(prev => {
      const users = new Map(prev.users);
      const user = users.get(userId) || {
        id: userId,
        isAudioMuted: false,
        isVideoOff: false,
        isLocal: false,
      };

      user.stream = stream;
      users.set(userId, user);
      return { ...prev, users };
    });
  }, []);

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

  /* ---------------- PeerConnection callbacks ---------------- */

  const onIceCandidate = useCallback(
    (candidate: RTCIceCandidate, targetUserId: string) => {
      sendSignal({
        to: targetUserId,
        from: localUserId,
        signal: { type: 'candidate', candidate: candidate.toJSON() },
      });
    },
    [localUserId]
  );

  const onTrack = useCallback(
    (event: RTCTrackEvent, remoteUserId: string) => {
      if (event.streams?.[0]) {
        addRemoteStream(remoteUserId, event.streams[0]);
      }
    },
    [addRemoteStream]
  );

  /* ---------------- PeerConnection creation ---------------- */

  const getOrCreatePC = useCallback(
    (remoteUserId: string) => {
      let pc = peerConnectionsRef.current.get(remoteUserId);

      if (!pc) {
        pc = createPeerConnection(
          localUserId,
          remoteUserId,
          localStreamRef.current,
          onIceCandidate,
          onTrack
        );

        peerConnectionsRef.current.set(remoteUserId, pc);
      }

      return pc;
    },
    [localUserId, onIceCandidate, onTrack]
  );

  /* ---------------- Signaling ---------------- */

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

  /* ---------------- Local media UI sync ---------------- */

  const setUsersLocalMedia = useCallback(
    (action: 'toggle-audio' | 'toggle-video', value: boolean) => {
      setState(prev => {
        const users = new Map(prev.users);
        const user = users.get(localUserId);
        if (!user) return prev;

        if (action === 'toggle-audio') user.isAudioMuted = value;
        if (action === 'toggle-video') user.isVideoOff = value;

        users.set(localUserId, user);
        return { ...prev, users };
      });
    },
    [localUserId]
  );

  /* ---------------- Socket events ---------------- */

  const {
    connect,
    disconnect,
    sendSignal,
    sendChatMessage,
    sendUserAction,
  } = useSocket({
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
        const user = users.get(userId);
        if (!user || user.isLocal) return prev;

        if (action === 'toggle-audio') user.isAudioMuted = value;
        if (action === 'toggle-video') user.isVideoOff = value;

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
  });

  /* ---------------- Lifecycle ---------------- */

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

  useEffect(() => {
    if (!localStream) return;

    setState(prev => {
      const users = new Map(prev.users);
      const existing = users.get(localUserId);

      users.set(localUserId, {
        id: localUserId,
        name: localUserId,
        stream: localStream,
        isAudioMuted: existing?.isAudioMuted ?? false,
        isVideoOff: existing?.isVideoOff ?? false,
        isLocal: true,
      });

      return { ...prev, users };
    });
  }, [localStream, localUserId]);

  /* ---------------- API ---------------- */

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
    isConnected: true,
  };
};
