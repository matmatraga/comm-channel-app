const express = require('express');
const multer = require('multer');
const { sendEmailHandler, receiveEmailsHandler } = require('../controllers/emailController');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/send', verifyToken, upload.array('attachments'), sendEmailHandler);
router.get('/receive', verifyToken, receiveEmailsHandler);

module.exports = router;