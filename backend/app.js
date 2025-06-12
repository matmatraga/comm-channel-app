const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const Socket = require('./middlewares/io');
const http = require('http');
const socketIO = require('socket.io');

// Load env variables and config
dotenv.config();
require('./config/passport');


// App & Server Initialization
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

// Attach io to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.set('io', io); // <-- Add this!

// Middlewares
const app = expressApp();
const server = http.createServer(app); // <-- Use this for socket.io
const io = socketIO(server, {
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true,
  }
});

// Attach io to app so routes can access it
app.set('io', io);

// CORS & body-parser
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sessions and Passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Static file serving (Chat Attachments)
app.use('/uploads/chat', express.static(path.join(__dirname, 'uploads', 'chat')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/emails', require('./routes/emailRoutes'));
app.use('/api/attachments', require('./routes/attachmentRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/sms', require('./routes/smsRoutes'));
app.use('/api/voice', require('./routes/voiceRoutes'));

// Socket.IO Logic
Socket(io);

// MongoDB Connection + Server Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(5000, () => console.log('🚀 Server running on port 5000'));
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/chat', chatRoutes);

// Serve uploaded chat files
app.use('/api/chat/file', expressApp.static(path.join(__dirname, 'uploads/chat')));

// Socket.io handling
io.on('connection', (socket) => {
  console.log('🟢 New client connected');

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected');
  });
});

// Connect to DB and start server
mongooseApp.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(5000, () => console.log('🚀 Server running on port 5000'));
  })
  .catch((err) => console.error(err));