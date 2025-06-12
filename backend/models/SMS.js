const mongoose = require('mongoose');

const smsSchema = new mongoose.Schema({
  from: { type: String, required: true },
  body: { type: String, required: true },
  receivedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SMS', smsSchema);