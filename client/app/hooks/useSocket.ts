import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketEventHandlers {
  onConnected?: (userId: string) => void;
  onUserConnected?: (data: { userId: string; roomId: string; timestamp: number }) => void;
  onUserDisconnected?: (data: { userId: string; roomId: string; reason: string; timestamp: number }) => void;
  onExistingUsers?: (data: { roomId: string; users: string[] }) => void;
  onSignal?: (data: { from: string; signal: any }) => void;
  onChatMessage?: (data: { userId: string; message: string; timestamp: number }) => void;
  onUserAction?: (data: { userId: string; action: string; value: any; timestamp: number }) => void;
  onError?: (error: { type: string; message: string }) => void;
}

export const useSocket = (handlers: SocketEventHandlers = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(handlers);

  // Update handlers ref whenever they change
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const connect = useCallback((roomId: string, userId: string) => {
    if (socketRef.current?.connected) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'ws://localhost:3001';

    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('join-room', roomId, userId);
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

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      handlersRef.current.onError?.(error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }, []); // Stable connect function

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const sendSignal = useCallback((data: { to: string; from: string; signal: any }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('signal', data);
    }
  }, []);

  const sendChatMessage = useCallback((roomId: string, userId: string, message: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat-message', { roomId, userId, message });
    }
  }, []);

  const sendUserAction = useCallback((roomId: string, userId: string, action: string, value: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('user-action', { roomId, userId, action, value });
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
    isConnected: socketRef.current?.connected || false,
  };
};
