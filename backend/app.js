const expressApp = require('express');
const mongooseApp = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const path = require('path');

dotenv.config();

require('./config/passport');

const app = expressApp();
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(expressApp.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/attachments', attachmentRoutes);
                   
mongooseApp.connect(process.env.MONGO_URI)

.then(() => {
  app.listen(5000, () => console.log('Server running on port 5000'));
})
.catch((err) => console.error(err));