import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import config from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { verifyToken } from './middleware/auth.js';
import User from './models/User.js';
import authRoutes from './routes/auth.js';
import conversationRoutes from './routes/conversations.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
mongoose
  .connect(config.mongoUri)
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch((err) => console.error('✗ MongoDB connection error:', err.message));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.io events
const userSockets = new Map(); // Map of userId to socket ids

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    return next(new Error('Invalid token'));
  }

  socket.userId = decoded.userId;
  next();
});

io.on('connection', async (socket) => {
  console.log(`✓ User connected: ${socket.userId}`);

  // Store user socket
  if (!userSockets.has(socket.userId)) {
    userSockets.set(socket.userId, []);
  }
  userSockets.get(socket.userId).push(socket.id);

  // Update user status to online
  await User.findByIdAndUpdate(socket.userId, {
    status: 'online',
    lastSeen: new Date(),
  });

  // Broadcast user online status
  io.emit('user_online', { userId: socket.userId });

  // Join user to their own room
  socket.join(`user_${socket.userId}`);

  // Handle new message
  socket.on('send_message', async (data) => {
    const { conversationId, content, mediaUrl, mediaType } = data;

    try {
      // Broadcast to conversation room
      io.to(`conversation_${conversationId}`).emit('new_message', {
        conversationId,
        sender: socket.userId,
        content,
        mediaUrl,
        mediaType,
        timestamp: new Date(),
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle join conversation
  socket.on('join_conversation', (data) => {
    const { conversationId } = data;
    socket.join(`conversation_${conversationId}`);
    io.to(`conversation_${conversationId}`).emit('user_joined', {
      userId: socket.userId,
      conversationId,
    });
  });

  // Handle leave conversation
  socket.on('leave_conversation', (data) => {
    const { conversationId } = data;
    socket.leave(`conversation_${conversationId}`);
    io.to(`conversation_${conversationId}`).emit('user_left', {
      userId: socket.userId,
      conversationId,
    });
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { conversationId } = data;
    io.to(`conversation_${conversationId}`).emit('user_typing', {
      userId: socket.userId,
      conversationId,
    });
  });

  // Handle stop typing
  socket.on('stop_typing', (data) => {
    const { conversationId } = data;
    io.to(`conversation_${conversationId}`).emit('user_stop_typing', {
      userId: socket.userId,
      conversationId,
    });
  });

  // Handle message read
  socket.on('message_read', (data) => {
    const { conversationId, messageId } = data;
    io.to(`conversation_${conversationId}`).emit('message_read', {
      messageId,
      userId: socket.userId,
    });
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(`✗ User disconnected: ${socket.userId}`);

    // Remove socket from map
    const userSockets_ = userSockets.get(socket.userId);
    if (userSockets_) {
      const index = userSockets_.indexOf(socket.id);
      if (index > -1) {
        userSockets_.splice(index, 1);
      }
      if (userSockets_.length === 0) {
        userSockets.delete(socket.userId);

        // Update user status to offline
        await User.findByIdAndUpdate(socket.userId, {
          status: 'offline',
          lastSeen: new Date(),
        });

        // Broadcast user offline status
        io.emit('user_offline', { userId: socket.userId });
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
httpServer.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

export default app;
