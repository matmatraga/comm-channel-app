const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return (v && v.trim().length > 0) || !!this.file;
        },
        message: "Either a message or file is required",
      },
    },
    file: { type: String },
    isRead: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    readAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
