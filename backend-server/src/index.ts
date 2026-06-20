import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { connectDB } from './db';
import './models'; // Import models to register them with Sequelize

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow connections from React Native app
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Expose Socket.io instance to routes
app.set('io', io);

const port = process.env.PORT || 5000;

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import listingRoutes from './routes/listingRoutes';
import chatRoutes from './routes/chatRoutes';
import uploadRoutes from './routes/uploadRoutes';
import userRoutes from './routes/userRoutes';
import reportRoutes from './routes/reportRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('MachineXchange API is running!');
});

// Socket.io Real-time connection handler
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join a specific chat room
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`👤 Client joined chat room: ${chatId}`);
  });

  // Join a user room for global events (like inbox updates)
  socket.on('joinUser', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 Client joined user room: user-${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Start Server & Connect to Database
server.listen(port, async () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
  await connectDB();
});

