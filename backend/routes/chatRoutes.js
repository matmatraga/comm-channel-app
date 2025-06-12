// === routes/chatRoutes.js ===
const express = require('express');
const router = express.Router();
const { uploadMiddleware, uploadChatFile } = require('../controllers/chatController');
const { downloadChatAttachment } = require('../controllers/chatAttachmentController');


router.post('/upload', verifyToken, uploadMiddleware, uploadChatFile);
// Download file
router.get('/download/:filename', verifyToken, downloadChatAttachment);

module.exports = router;