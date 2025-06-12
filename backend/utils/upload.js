// utils/fileUpload.js
const multer = require('multer');
const path = require('path');

const CHAT_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'chat');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, CHAT_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const uploadChatAttachment = multer({ storage });

module.exports = { uploadChatAttachment, CHAT_UPLOAD_DIR };
