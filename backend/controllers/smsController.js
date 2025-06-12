const { sendSMS } = require('../services/smsService');
const { MessagingResponse } = require('twilio').twiml;

exports.sendTextMessage = async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Recipient number and message are required.' });
  }

  try {
    const response = await sendSMS(to, message);
    res.status(200).json({ success: true, sid: response.sid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send SMS.' });
  }
};

// Webhook endpoint for incoming SMS
exports.receiveSMS = (req, res) => {
  console.log('📨 Twilio Webhook Body:', req.body);

  const { From, Body } = req.body; // Make sure keys are capitalized like Twilio sends them

  if (!From || !Body) {
    return res.status(400).send('Missing required fields');
  }

  // Emit to frontend via socket
  const io = req.app.get('io');
  io.emit('incoming_sms', { from: From, body: Body });

  // Respond to Twilio
  const twiml = new MessagingResponse();
  res.type('text/xml').send(twiml.toString());
};