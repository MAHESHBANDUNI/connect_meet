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
}

interface UserAction {
  roomId: string;
  userId: string;
  action: string;
  value: any;
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

const rooms = new Map<string, Set<string>>();
const users = new Map<string, UserInfo>();

io.on('connection', (socket: Socket) => {
  console.log('New connection:', socket.id);

  // Join a room
  socket.on('join-room', (roomId: string, userId: string) => {
    console.log(`User ${userId} joining room ${roomId}`);
    
    // Leave any previous room
    if (users.has(socket.id)) {
      const { roomId: oldRoomId } = users.get(socket.id)!;
      socket.leave(oldRoomId);
      
      if (rooms.has(oldRoomId)) {
        rooms.get(oldRoomId)!.delete(socket.id);
        if (rooms.get(oldRoomId)!.size === 0) {
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
      rooms.set(roomId, new Set<string>());
    }
    rooms.get(roomId)!.add(socket.id);
    
    users.set(socket.id, { userId, roomId });
    
    // Get all other users in the room
    const otherUsers = Array.from(rooms.get(roomId)!)
      .filter(id => id !== socket.id)
      .map(id => users.get(id)!.userId);
    
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
    
    console.log(`Room ${roomId}: ${rooms.get(roomId)!.size} users`);
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
  socket.on('chat-message', ({ roomId, userId, message }: ChatMessage) => {
    console.log(`Chat from ${userId} in ${roomId}`);
    socket.to(roomId).emit('chat-message', { 
      userId, 
      message,
      timestamp: Date.now()
    });
  });

  // Handle user actions (mute, video toggle, etc.)
  socket.on('user-action', ({ roomId, userId, action, value }: UserAction) => {
    console.log(`Action ${action} from ${userId} in ${roomId}`);
    socket.to(roomId).emit('user-action', { 
      userId, 
      action, 
      value,
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
        rooms.get(roomId)!.delete(socket.id);
        
        // Notify others in room
        socket.to(roomId).emit('user-disconnected', { 
          userId, 
          roomId,
          reason: 'disconnected',
          timestamp: Date.now()
        } as UserDisconnectionData);
        
        // Clean up empty rooms
        if (rooms.get(roomId)!.size === 0) {
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