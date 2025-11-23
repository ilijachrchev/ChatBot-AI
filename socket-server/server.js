const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://your-vercel-domain.vercel.app',
      'https://*.vercel.app',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.get('/', (req, res) => {
  res.json({ status: 'Socket.IO server is running' });
});

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  socket.on('join-chatroom', (chatroomId) => {
    socket.join(chatroomId);
    console.log(`🔌 Socket ${socket.id} joined chatroom: ${chatroomId}`);
  });

  socket.on('leave-chatroom', (chatroomId) => {
    socket.leave(chatroomId);
    console.log(`🔌 Socket ${socket.id} left chatroom: ${chatroomId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

app.post('/api/trigger', (req, res) => {
  const { chatroomId, event, data } = req.body;

  if (!chatroomId || !event || !data) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  io.to(chatroomId).emit(event, data);
  
  console.log(`📨 Triggered event "${event}" in chatroom: ${chatroomId}`);
  
  res.json({ success: true, message: 'Event triggered' });
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
});