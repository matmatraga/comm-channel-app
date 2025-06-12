// === routes/chatRoutes.js ===
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const chatController = require('../controllers/chatController');

// Send message (with file upload)
router.post('/', upload.single('file'), chatController.sendMessage);

// Get messages between users by email
router.get('/:senderEmail/:receiverEmail', chatController.getMessages);

module.exports = router;