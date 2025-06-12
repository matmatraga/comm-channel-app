
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

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const CHAT_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'chat');

if (!fs.existsSync(CHAT_UPLOAD_DIR)) {
  fs.mkdirSync(CHAT_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CHAT_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const chatMessages = [];

router.post('/send', upload.single('file'), (req, res) => {
  const { sender, message } = req.body;
  const file = req.file ? {
    filename: req.file.originalname,
    path: `/api/chat/file/${req.file.filename}`,
  } : null;

  const chat = {
    id: Date.now(),
    sender,
    message,
    file,
    timestamp: new Date(),
  };

  chatMessages.push(chat);
  req.app.get('io').emit('chat', chat);

  res.status(200).json(chat);
});

router.get('/history', (req, res) => {
  res.json(chatMessages);
});

router.get('/file/:filename', (req, res) => {
  const filePath = path.join(CHAT_UPLOAD_DIR, req.params.filename);
  res.download(filePath);
});

module.exports = router;