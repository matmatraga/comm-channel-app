const expressRouter = require('express');
const router = expressRouter.Router();
const passport = require('passport');
const { register, login } = require('../controllers/authController');
const createToken  = require('../utils/token.js');

router.post('/register', register);
router.post('/login', login);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = createToken(req.user);
    const userData = {
      name: req.user.name,
      email: req.user.email,
    };
    res.redirect(`http://localhost:5173/google-login?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
  });


module.exports = router;