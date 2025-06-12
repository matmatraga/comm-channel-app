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
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// Attach io to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'https://abec-136-158-78-140.ngrok-free.app/'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

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

// Socket.IO Logic
Socket(io);

// MongoDB Connection + Server Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(5000, () => console.log('🚀 Server running on port 5000'));
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
