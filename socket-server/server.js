const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const multer = require('multer');
const path = require('path');
const fs = require('fs');


const app = express();
app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

app.use('/uploads', express.static(uploadsDir));

const httpServer = createServer(app);


const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? [process.env.ALLOWED_ORIGIN].filter(Boolean)
      : ['http://localhost:3000', process.env.ALLOWED_ORIGIN].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.get('/', (req, res) => {
  res.json({ status: 'Socket.IO server is running' });
});

io.use((socket, next) => {
  const secret = socket.handshake.auth?.secret;
  const origin = socket.handshake.headers?.origin;
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
  if (secret === process.env.SOCKET_SHARED_SECRET) {
    socket.data.isOwner = true;
    return next();
  }
  if (origin && allowedOrigin.includes(origin)) {
    socket.data.isOwner = false;
    return next();
  }
  if (process.env.NODE_ENV !== 'production') {
    socket.data.isOwner = false;
    return next();
  }
  next(new Error('Unauthorized'));
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


app.post('/api/upload', (req, res, next) => {
  const secret = req.headers['x-socket-secret'];
  if (!secret || secret !== process.env.SOCKET_SHARED_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  console.log('📁 File uploaded:', req.file.filename);
  res.json({ success: true, url: fileUrl, filename: req.file.filename });
});


app.post('/api/trigger', (req, res) => {
  const secret = req.headers['x-socket-secret'];
  if (!secret || secret !== process.env.SOCKET_SHARED_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
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