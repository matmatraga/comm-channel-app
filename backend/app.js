const expressApp = require('express');
const mongooseApp = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');

dotenv.config();

require('./config/passport');

const app = expressApp();
app.use(cors());
app.use(expressApp.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);

mongooseApp.connect(process.env.MONGO_URI)

.then(() => {
  app.listen(5000, () => console.log('Server running on port 5000'));
})
.catch((err) => console.error(err));