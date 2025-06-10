const expressApp = require('express');
const mongooseApp = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

dotenv.config();

require('./config/passport');

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
  origin: ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(expressApp.json());

// Sessions and Passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

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
