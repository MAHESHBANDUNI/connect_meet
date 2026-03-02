import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketEventHandlers {
  onConnected?: (userId: string) => void;
  onUserConnected?: (data: { userId: string; roomId: string; timestamp: number }) => void;
  onUserDisconnected?: (data: { userId: string; roomId: string; reason: string; timestamp: number }) => void;
  onExistingUsers?: (data: { roomId: string; users: string[] }) => void;
  onSignal?: (data: { from: string; signal: any }) => void;
  onChatMessage?: (data: { userId: string; message: string; timestamp: number; targetUserId?: string; isDirect?: boolean }) => void;
  onUserAction?: (data: { userId: string; action: string; value: any; timestamp: number; targetUserId?: string }) => void;
  onForceStopScreen?: () => void;
  onJoinRequest?: (data: { userId: string; roomId: string }) => void;
  onJoinResponse?: (data: { approved: boolean }) => void;
  onWaitingUsers?: (data: { users: { userId: string }[] }) => void;
  onMeetingEnded?: (data: { roomId: string; endedBy: string; timestamp: number }) => void;
  onError?: (error: { type: string; message: string }) => void;
}

export const useSocket = (handlers: SocketEventHandlers = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(handlers);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const connect = useCallback((roomId: string, userId: string) => {
    if (socketRef.current) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;

    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);  
      setIsConnected(true);
      handlersRef.current.onConnected?.(userId);
    });

    socket.on('user-connected', (data) => {
      console.log('User connected:', data.userId);
      handlersRef.current.onUserConnected?.(data);
    });

    socket.on('user-disconnected', (data) => {
      console.log('User disconnected:', data.userId);
      handlersRef.current.onUserDisconnected?.(data);
    });

    socket.on('existing-users', (data) => {
      console.log('Existing users:', data.users);
      handlersRef.current.onExistingUsers?.(data);
    });

    socket.on('signal', (data) => {
      console.log('Received signal from:', data.from);
      handlersRef.current.onSignal?.(data);
    });

    socket.on('chat-message', (data) => {
      handlersRef.current.onChatMessage?.(data);
    });

    socket.on('user-action', (data) => {
      handlersRef.current.onUserAction?.(data);
    });

    socket.on('join-request', (data) => {
      console.log('Received join request:', data);
      handlersRef.current.onJoinRequest?.(data);
    });

    socket.on('join-response', (data) => {
      console.log('Received join response:', data);
      handlersRef.current.onJoinResponse?.(data);
    });

    socket.on('waiting-users', (data) => {
      console.log('Received waiting users:', data);
      handlersRef.current.onWaitingUsers?.(data);
    });

    socket.on('meeting-ended', (data) => {
      console.log('Meeting ended:', data);
      handlersRef.current.onMeetingEnded?.(data);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      handlersRef.current.onError?.(error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendSignal = useCallback((data: { to: string; from: string; signal: any }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('signal', data);
    }
  }, []);

  const sendChatMessage = useCallback((roomId: string, userId: string, message: string, targetUserId?: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat-message', { roomId, userId, message, targetUserId });
    }
  }, []);

  const sendUserAction = useCallback((roomId: string, userId: string, action: string, value: any, targetUserId?: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('user-action', { roomId, userId, action, value, targetUserId });
    }
  }, []);

  const joinRoom = useCallback((roomId: string, userId: string, isHost: boolean = false, isWaiting: boolean = false) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-room', roomId, userId, isHost, isWaiting);
    }
  }, []);

  const sendJoinResponse = useCallback((roomId: string, targetUserId: string, approved: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-response', { roomId, targetUserId, approved });
    }
  }, []);

  const sendMeetingEnded = useCallback((roomId: string, userId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('meeting-ended', { roomId, userId });
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    sendSignal,
    sendChatMessage,
    sendUserAction,
    sendJoinResponse,
    sendMeetingEnded,
    joinRoom,
    isConnected,
  };
}
