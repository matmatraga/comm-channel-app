// === chatController.js ===
const path = require('path');
const fs = require('fs');
const { CHAT_UPLOAD_DIR } = require('../utils/upload');

exports.uploadChatAttachment = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  res.status(200).json({ filename: req.file.filename });
};

exports.downloadChatAttachment = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(CHAT_UPLOAD_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.download(filePath, filename);
};