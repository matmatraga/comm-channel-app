// routes/chatAttachmentRoutes.js
const express = require("express");
const {
  uploadChatAttachment,
  downloadChatAttachment,
  getChatHistory,
} = require("../controllers/chatController");
const { uploadChatAttachment: upload } = require("../utils/upload");
const { verifyToken } = require("../middlewares/auth");

const router = express.Router();

router.post(
  "/upload",
  verifyToken,
  upload.single("file"),
  uploadChatAttachment
);
router.get("/download/:filename", downloadChatAttachment);
router.get("/history/:receiverId", verifyToken, getChatHistory);

module.exports = router;
