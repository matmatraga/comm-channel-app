// === chatController.js ===
const Chat = require('../models/Chat');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

exports.sendMessage = async (req, res) => {
  try {
    const { senderEmail, receiverEmail, message } = req.body;
    const file = req.file ? req.file.filename : null;

    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'Sender or receiver not found' });
    }

    const chat = new Chat({
      sender: sender._id,
      receiver: receiver._id,
      message,
      file,
    });
    await chat.save();

    console.log('Message sent:', chat);

    const populatedChat = await chat.populate('sender', 'email name').populate('receiver', 'email name');

    res.status(200).json(populatedChat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { senderEmail, receiverEmail } = req.params;

    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'Sender or receiver not found' });
    }

    const messages = await Chat.find({
      $or: [
        { sender: sender._id, receiver: receiver._id },
        { sender: receiver._id, receiver: sender._id },
      ],
    })
      .populate('sender', 'email name')
      .populate('receiver', 'email name')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/chat');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

exports.uploadMiddleware = upload.single('file');

exports.uploadChatFile = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  res.json({ filename: req.file.filename });
};