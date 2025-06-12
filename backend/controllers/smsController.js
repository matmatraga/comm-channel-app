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
  console.log(req.body); // Log the incoming request body for debugging
  // const { From, Body } = req.body;
  // console.log(`📥 Incoming SMS from ${From}: ${Body}`);

  // // Emit to frontend via Socket.IO
  // const io = req.app.get('io'); // <-- Access from app.set('io')
  // io.emit('incoming_sms', { from: From, body: Body });

  // // Twilio requires a valid XML response
  // const twiml = new MessagingResponse();
  // res.type('text/xml').send(twiml.toString());
};