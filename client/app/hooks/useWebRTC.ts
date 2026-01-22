import { useState, useRef, useCallback, useEffect } from 'react';
import { createPeerConnection, addIceCandidate, createOffer, createAnswer, replaceTrack } from '@/app/utils/webrtc';
import { useSocket } from './useSocket';
import { User, Message } from '@/app/types';

interface WebRTCState {
  users: Map<string, User>;
  messages: Message[];
  localUserId: string;
  roomId: string;
}

export const useWebRTC = (localUserId: string, roomId: string, localStream: MediaStream | null) => {
  const [state, setState] = useState<WebRTCState>({
    users: new Map(),
    messages: [],
    localUserId,
    roomId,
  });

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(localStream);

  // Keep localStreamRef updated
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const addRemoteStream = useCallback((userId: string, stream: MediaStream) => {
    remoteStreamsRef.current.set(userId, stream);

    setState(prev => {
      const users = new Map(prev.users);
      const user = users.get(userId) || { id: userId, isAudioMuted: false, isVideoOff: false, isLocal: false };
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

  const onIceCandidate = useCallback((candidate: RTCIceCandidate, targetUserId: string) => {
    sendSignal({
      to: targetUserId,
      from: localUserId,
      signal: { type: 'candidate', candidate: candidate.toJSON() },
    });
  }, [localUserId]);

  const onTrack = useCallback((event: RTCTrackEvent, remoteUserId: string) => {
    if (event.streams && event.streams[0]) {
      addRemoteStream(remoteUserId, event.streams[0]);
    }
  }, [addRemoteStream]);

  const initializePeerConnection = useCallback(async (remoteUserId: string) => {
    const pc = createPeerConnection(remoteUserId, remoteUserId, onIceCandidate, onTrack);
    peerConnectionsRef.current.set(remoteUserId, pc);

    const stream = localStreamRef.current;
    if (stream) {
      try {
        const offer = await createOffer(pc, stream);
        sendSignal({
          to: remoteUserId,
          from: localUserId,
          signal: { type: 'offer', sdp: offer.sdp },
        });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }
  }, [localUserId, onIceCandidate, onTrack]);

  const handleSignal = useCallback(async (from: string, signal: any) => {
    let pc = peerConnectionsRef.current.get(from);

    if (!pc) {
      pc = createPeerConnection(from, from, onIceCandidate, onTrack);
      peerConnectionsRef.current.set(from, pc);
    }

    try {
      if (signal.type === 'offer') {
        const stream = localStreamRef.current || new MediaStream();
        const answer = await createAnswer(pc, stream, signal);
        sendSignal({
          to: from,
          from: localUserId,
          signal: { type: 'answer', sdp: answer.sdp },
        });
      } else if (signal.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
      } else if (signal.type === 'candidate') {
        await addIceCandidate(pc, signal.candidate);
      }
    } catch (error) {
      console.error('Error handling signal:', error);
    }
  }, [localUserId, onIceCandidate, onTrack]);

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
  
  const handleUserConnected = useCallback((userId: string) => {
    if (userId !== localUserId) {
      setState(prev => {
        const users = new Map(prev.users);
        if (!users.has(userId)) {
          users.set(userId, { id: userId, isAudioMuted: false, isVideoOff: false, isLocal: false });
        }
        return { ...prev, users };
      });

      initializePeerConnection(userId);
    }
  }, [localUserId, initializePeerConnection]);

  const handleUserDisconnected = useCallback((userId: string) => {
    removeUser(userId);
  }, [removeUser]);

  const {
    connect: connectSocket,
    disconnect: disconnectSocket,
    sendSignal,
    sendChatMessage,
    sendUserAction
  } = useSocket({
    onUserConnected: (data) => handleUserConnected(data.userId),
    onUserDisconnected: (data) => handleUserDisconnected(data.userId),
    onExistingUsers: (data) => {
      data.users.forEach(userId => {
        if (userId !== localUserId) {
          handleUserConnected(userId);
        }
      });
    },
    onSignal: (data) => handleSignal(data.from, data.signal),
    onUserAction: (data) => {
      setState(prev => {
        const users = new Map(prev.users);
        const user = users.get(data.userId);

        if (!user) return prev;

        // ❌ Ignore socket updates for self
        if (user.isLocal) return prev;

        if (data.action === 'toggle-audio') user.isAudioMuted = data.value;
        if (data.action === 'toggle-video') user.isVideoOff = data.value;

        users.set(data.userId, user);
        return { ...prev, users };
      });
    },
    onChatMessage: (data) => {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          id: Date.now().toString(),
          userId: data.userId,
          content: data.message,
          timestamp: new Date(data.timestamp),
          isLocal: false
        }]
      }));
    }
  });

  useEffect(() => {
    if (localUserId && roomId) {
      connectSocket(roomId, localUserId);
    }

    return () => {
      disconnectSocket();
      peerConnectionsRef.current.forEach(pc => pc.close());
      peerConnectionsRef.current.clear();
      remoteStreamsRef.current.clear();
    };
  }, [localUserId, roomId, connectSocket, disconnectSocket]);

  useEffect(() => {
    if (localStream) {
      peerConnectionsRef.current.forEach(pc => {
        replaceTrack(pc, localStream);
      });
    }
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

  return {
    users: Array.from(state.users.values()),
    messages: state.messages,
    sendChatMessage: (content: string) => {
      const message = {
        id: Date.now().toString(),
        userId: localUserId,
        content,
        timestamp: new Date(),
      };
      sendChatMessage(roomId, localUserId, content);
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, { ...message, isLocal: true }],
      }));
    },
    setUsersLocalMedia,
    sendUserAction,
    isConnected: true
  };
};