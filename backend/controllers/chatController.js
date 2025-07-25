// === chatController.js ===
const path = require("path");
const fs = require("fs");
const { CHAT_UPLOAD_DIR } = require("../utils/upload");
const Chat = require("../models/Chat");

exports.uploadChatAttachment = (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  res.status(200).json({ filename: req.file.filename });
};

exports.downloadChatAttachment = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(CHAT_UPLOAD_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.download(filePath, filename);
};

exports.getChatHistory = async (req, res) => {
  const currentUserId = req.user._id;
  const receiverId = req.params.receiverId;

  try {
    // ✅ Mark all unread messages sent *to* current user as read
    await Chat.updateMany(
      { sender: receiverId, receiver: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    // Fetch full chat history
    const chats = await Chat.find({
      $or: [
        { sender: currentUserId, receiver: receiverId },
        { sender: receiverId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name _id")
      .populate("receiver", "name _id");

    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("❌ Error fetching chat history:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch chat history" });
  }
};
