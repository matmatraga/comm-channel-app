const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const { CHAT_UPLOAD_DIR } = require("../utils/upload");
const Chat = require("../models/Chat");
const User = require("../models/User");

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
  const currentUserId = req.user.id;
  const receiverId = req.params.receiverId;

  try {
    await Chat.updateMany(
      { sender: receiverId, receiver: currentUserId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

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
    console.error("Error fetching chat history:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch chat history" });
  }
};

exports.getConversations = async (req, res) => {
  const currentUserId = new mongoose.Types.ObjectId(req.user.id);

  try {
    const conversations = await Chat.aggregate([
      {
        $match: {
          $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          partner: {
            $cond: [
              { $eq: ["$sender", currentUserId] },
              "$receiver",
              "$sender",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$partner",
          lastMessage: { $first: "$message" },
          lastMessageAt: { $first: "$createdAt" },
          lastFile: { $first: "$file" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", currentUserId] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    const partnerIds = conversations.map((c) => c._id);
    const partners = await User.find({ _id: { $in: partnerIds } }).select(
      "name _id"
    );
    const partnerMap = Object.fromEntries(
      partners.map((p) => [p._id.toString(), p])
    );

    const result = conversations.map((c) => ({
      partner: partnerMap[c._id.toString()] || { _id: c._id, name: "User" },
      lastMessage: c.lastFile ? "📎 Attachment" : c.lastMessage,
      lastMessageAt: c.lastMessageAt,
      unreadCount: c.unreadCount,
    }));

    res.status(200).json({ success: true, conversations: result });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};
