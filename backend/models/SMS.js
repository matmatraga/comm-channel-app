const mongoose = require("mongoose");

const smsSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true }, // add recipient
  body: { type: String, required: true },
  status: {
    type: String,
    enum: ["sent", "received"],
    required: true,
  },
  receivedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SMS", smsSchema);
