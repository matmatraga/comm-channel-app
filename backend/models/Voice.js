const mongoose = require('mongoose');

const voiceSchema = new mongoose.Schema({
  callSid: { type: String, required: true, unique: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  status: { type: String },
  duration: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Voice', voiceSchema);
