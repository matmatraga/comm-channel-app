const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const Socket = require('./middlewares/io');

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
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Serve static files from /uploads/chat
app.use('/uploads/chat', express.static(path.join(__dirname, 'uploads/chat')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/emails', require('./routes/emailRoutes'));
app.use('/api/attachments', require('./routes/attachmentRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/sms', require('./routes/smsRoutes'));
app.use('/api/voice', require('./routes/voiceRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));


// Socket.IO Logic
Socket(io);

// MongoDB Connection + Server Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(5000, () => console.log('🚀 Server running on port 5000'));
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));