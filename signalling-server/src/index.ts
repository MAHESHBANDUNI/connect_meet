import dotenv from 'dotenv';
import { Server, Socket } from 'socket.io';
import http from 'http';
import { AddressInfo } from 'net';

dotenv.config();

interface UserInfo {
  userId: string;
  roomId: string;
}

interface SignalData {
  to: string;
  from: string;
  signal: any;
}

interface ChatMessage {
  roomId: string;
  userId: string;
  message: string;
  targetUserId?: string;
}

interface UserAction {
  roomId: string;
  userId: string;
  action: 'toggle-audio' | 'toggle-video' | 'toggle-screen' | 'host-mute-audio' | 'host-mute-video' | 'host-drop-user';
  value: boolean;
  targetUserId?: string;
}

interface MeetingEndedPayload {
  roomId: string;
  userId: string;
}

interface ServerStats {
  status: string;
  rooms: number;
  users: number;
  uptime: number;
  timestamp: number;
}

interface UserConnectionData {
  userId: string;
  roomId: string;
  timestamp: number;
}

interface UserDisconnectionData {
  userId: string;
  roomId: string;
  reason: string;
  timestamp: number;
}

interface RoomData {
  users: Set<string>;
  waitingUsers: Set<string>;
  activeScreenSharer: string | null;
  hostUserId: string | null;
}

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

const rooms = new Map<string, RoomData>();
const users = new Map<string, UserInfo>();

io.on('connection', (socket: Socket) => {
  console.log('New connection:', socket.id);

  // Join a room
  socket.on('join-room', (roomId: string, userId: string, isHost: boolean = false, isWaiting: boolean = false) => {
    console.log(`User ${userId} joining room ${roomId} (Host: ${isHost}, Waiting: ${isWaiting})`);

    // Leave any previous room
    if (users.has(socket.id)) {
      const { roomId: oldRoomId } = users.get(socket.id)!;
      socket.leave(oldRoomId);

      if (rooms.has(oldRoomId)) {
        rooms.get(oldRoomId)!.users.delete(socket.id);
        rooms.get(oldRoomId)!.waitingUsers?.delete(socket.id);
        if (rooms.get(oldRoomId)!.users.size === 0 && (!rooms.get(oldRoomId)!.waitingUsers || rooms.get(oldRoomId)!.waitingUsers.size === 0)) {
          rooms.delete(oldRoomId);
        }

        // Notify old room
        socket.to(oldRoomId).emit('user-left', {
          userId,
          roomId: oldRoomId
        });
      }
    }

    // Join new room
    socket.join(roomId);

    // Update tracking
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Set<string>(),
        waitingUsers: new Set<string>(),
        activeScreenSharer: null,
        hostUserId: isHost ? userId : null
      });
    }

    const room = rooms.get(roomId)!;
    if (isHost) {
      room.hostUserId = userId;

      // If there are waiting users, send them to the host immediately
      if (room.waitingUsers.size > 0) {
        const waitingList = Array.from(room.waitingUsers)
          .map(sId => {
            const userData = users.get(sId);
            return userData ? { userId: userData.userId } : null;
          })
          .filter((u): u is { userId: string } => u !== null);

        socket.emit('waiting-users', { users: waitingList });
      }
    }

    if (isWaiting) {
      room.waitingUsers.add(socket.id);
      users.set(socket.id, { userId, roomId });

      // Notify host about waiting user
      if (room.hostUserId) {
        let hostSocketId: string | null = null;
        for (const [sId, userData] of users.entries()) {
          if (userData.userId === room.hostUserId) {
            hostSocketId = sId;
            break;
          }
        }
        if (hostSocketId) {
          io.to(hostSocketId).emit('join-request', { userId, roomId });
        }
      }
      return;
    }

    room.users.add(socket.id);
    users.set(socket.id, { userId, roomId });

    // Get all other users in the room
    const otherUsers = Array.from(room.users)
      .filter(id => id !== socket.id)
      .map(id => users.get(id)?.userId)
      .filter((id): id is string => id !== undefined);

    // Notify new user of existing users
    socket.emit('existing-users', {
      roomId,
      users: otherUsers
    });

    // Notify others in room about new user
    socket.to(roomId).emit('user-connected', {
      userId,
      roomId,
      timestamp: Date.now()
    } as UserConnectionData);

    console.log(`Room ${roomId}: ${room.users.size} users, ${room.waitingUsers.size} waiting`);
  });

  // Handle WebRTC signalling
  socket.on('signal', ({ to, from, signal }: SignalData) => {
    console.log(`Signal from ${from} to ${to}`,
      signal?.type || 'candidate' || 'unknown signal type');

    // Find target socket
    let targetSocketId: string | null = null;
    for (const [sId, userData] of users.entries()) {
      if (userData.userId === to) {
        targetSocketId = sId;
        break;
      }
    }

    if (targetSocketId) {
      io.to(targetSocketId).emit('signal', {
        from: from || users.get(socket.id)?.userId,
        signal
      });
    } else {
      console.log(`Target user ${to} not found`);
      socket.emit('error', {
        type: 'USER_NOT_FOUND',
        message: `User ${to} is not connected`
      });
    }
  });

  // Handle chat messages
  socket.on('chat-message', ({ roomId, userId, message, targetUserId }: ChatMessage) => {
    const room = rooms.get(roomId);
    if (!room) return;

    if (targetUserId) {
      let targetSocketId: string | null = null;
      for (const [sId, userData] of users.entries()) {
        if (userData.userId === targetUserId && room.users.has(sId)) {
          targetSocketId = sId;
          break;
        }
      }

      if (!targetSocketId) {
        socket.emit('error', {
          type: 'USER_NOT_FOUND',
          message: `User ${targetUserId} is not available in this meeting`
        });
        return;
      }

      console.log(`Direct chat from ${userId} to ${targetUserId} in ${roomId}`);
      io.to(targetSocketId).emit('chat-message', {
        userId,
        message,
        targetUserId,
        isDirect: true,
        timestamp: Date.now()
      });
      return;
    }

    console.log(`Chat from ${userId} in ${roomId}`);
    socket.to(roomId).emit('chat-message', {
      userId,
      message,
      isDirect: false,
      timestamp: Date.now()
    });
  });

  // Handle user actions (mute, video toggle, etc.)
  socket.on('user-action', ({ roomId, userId, action, value, targetUserId }: UserAction) => {
    const room = rooms.get(roomId);
    if (!room) return;

    // SCREEN SHARING CONTROL
    if (action === 'toggle-screen') {

      // Someone wants to START sharing
      if (value === true) {

        // If someone else is already sharing
        if (room.activeScreenSharer && room.activeScreenSharer !== userId) {

          // Find previous sharer socket
          for (const [sId, userData] of users.entries()) {
            if (userData.userId === room.activeScreenSharer) {

              // Force stop previous sharer
              io.to(sId).emit('force-stop-screen');

              // Notify room that previous sharer stopped
              io.to(roomId).emit('user-action', {
                userId: room.activeScreenSharer,
                action: 'toggle-screen',
                value: false,
                timestamp: Date.now()
              });

              break;
            }
          }
        }

        // Set new active sharer
        room.activeScreenSharer = userId;
      }

      // Someone stopped sharing
      if (value === false) {
        if (room.activeScreenSharer === userId) {
          room.activeScreenSharer = null;
        }
      }
    }

    // Broadcast action to others
    if (targetUserId) {
      socket.to(roomId).emit('user-action', {
        userId,
        action,
        value,
        targetUserId,
        timestamp: Date.now()
      });
    } else {
      socket.to(roomId).emit('user-action', {
        userId,
        action,
        value,
        timestamp: Date.now()
      });
    }
  });

  socket.on('join-request', ({ roomId, userId }) => {
    const room = rooms.get(roomId);

    if (!room || !room.hostUserId) {
      socket.emit('error', {
        type: 'ROOM_NOT_FOUND',
        message: 'Room does not exist'
      });
      return;
    }

    // Find host socket
    let hostSocketId: string | null = null;

    for (const [sId, userData] of users.entries()) {
      if (userData.userId === room.hostUserId) {
        hostSocketId = sId;
        break;
      }
    }

    if (!hostSocketId) {
      socket.emit('error', {
        type: 'HOST_NOT_FOUND',
        message: 'Host is not connected'
      });
      return;
    }

    // Send join request to host only
    io.to(hostSocketId).emit('join-request', {
      userId,
      roomId
    });

    console.log(`Join request from ${userId} sent to host`);
  });

  socket.on('join-response', ({ roomId, targetUserId, approved }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    let targetSocketId: string | null = null;
    for (const [sId, userData] of users.entries()) {
      if (userData.userId === targetUserId && room.waitingUsers.has(sId)) {
        targetSocketId = sId;
        break;
      }
    }

    if (!targetSocketId) return;

    if (approved) {
      room.waitingUsers.delete(targetSocketId);
      room.users.add(targetSocketId);

      // Notify the target user they are admitted
      io.to(targetSocketId).emit('join-response', { approved: true });

      // Notify others about the new user
      const userData = users.get(targetSocketId)!;
      io.to(roomId).emit('user-connected', {
        userId: userData.userId,
        roomId,
        timestamp: Date.now()
      });

      // Send existing users to the new user
      const otherUsers = Array.from(room.users)
        .filter(id => id !== targetSocketId)
        .map(id => users.get(id)!.userId);

      io.to(targetSocketId).emit('existing-users', {
        roomId,
        users: otherUsers
      });
    } else {
      room.waitingUsers.delete(targetSocketId);
      io.to(targetSocketId).emit('join-response', { approved: false });
    }
  });

  socket.on('meeting-ended', ({ roomId, userId }: MeetingEndedPayload) => {
    const room = rooms.get(roomId);
    if (!room) return;

    if (room.hostUserId !== userId) {
      socket.emit('error', {
        type: 'FORBIDDEN',
        message: 'Only host can end the meeting'
      });
      return;
    }

    io.to(roomId).emit('meeting-ended', {
      roomId,
      endedBy: userId,
      timestamp: Date.now()
    });
  });

  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  // Handle disconnect
  socket.on('disconnect', (reason: string) => {
    console.log('Disconnected:', socket.id, reason);

    if (users.has(socket.id)) {
      const { userId, roomId } = users.get(socket.id)!;

      // Remove from room
      if (rooms.has(roomId)) {
        rooms.get(roomId)!.users.delete(socket.id);

        // If the disconnected user was the active screen sharer, update room state
        if (rooms.get(roomId)!.activeScreenSharer === userId) {
          rooms.get(roomId)!.activeScreenSharer = null;
        }

        // Notify others in room
        socket.to(roomId).emit('user-disconnected', {
          userId,
          roomId,
          reason: 'disconnected',
          timestamp: Date.now()
        } as UserDisconnectionData);

        // Clean up empty rooms
        if (rooms.get(roomId)!.users.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} cleaned up (empty)`);
        }
      }

      // Remove from users map
      users.delete(socket.id);

      console.log(`Stats - Rooms: ${rooms.size}, Users: ${users.size}`);
    }
  });

  // Handle errors
  socket.on('error', (error: Error) => {
    console.error('Socket error:', error);
  });
});

// Simple health check endpoint
server.on('request', (req: http.IncomingMessage, res: http.ServerResponse) => {
  if (req.url === '/health' && req.method === 'GET') {
    const stats: ServerStats = {
      status: 'ok',
      rooms: rooms.size,
      users: users.size,
      uptime: process.uptime(),
      timestamp: Date.now()
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats));
    return;
  }

  // Reject other HTTP requests
  res.writeHead(404);
  res.end();
});

const PORT = parseInt(process.env.PORT || '3001', 10);
server.listen(PORT, () => {
  const address = server.address() as AddressInfo;
  console.log(`
  Server listening on localhost:${PORT}
  `);
});

// Handle graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`${signal} received, closing server...`);

  // Notify all connected clients
  io.emit('server-shutdown', {
    message: 'Server is shutting down',
    timestamp: Date.now()
  });

  // Close server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.log('Forcing server shutdown');
    process.exit(1);
  }, 10000);
};

// Register signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
