const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const Message = require('./models/Message');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/mentors', require('./routes/mentorRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO — Real-time chat with room support
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', ({ roomId, userName }) => {
    socket.join(roomId);
    console.log(`${userName} joined room ${roomId}`);
    socket.to(roomId).emit('userJoined', { userName, message: `${userName} has joined the chat.` });
  });

  socket.on('sendMessage', async ({ roomId, senderId, text, senderName }) => {
    try {
      // Persist message to database
      const message = await Message.create({ senderId, roomId, text });

      // Broadcast to all in the room
      io.to(roomId).emit('receiveMessage', {
        _id: message._id,
        senderId,
        senderName,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: message.createdAt
      });
    } catch (error) {
      console.error('Message error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});
