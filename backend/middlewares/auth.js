// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ error: 'User not found' });

    // Ensure credentials exist
    if (!user.email || !user.password) {
      return res.status(401).json({ error: 'User email credentials are missing' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      password: user.password,
    };

    next();
  } catch (err) {
    console.error('[AUTH ERROR]', err);
    return res.status(401).json({ error: 'Token verification failed' });
  }
};
