const SMS = require('../models/SMS');
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
exports.receiveSMS = async (req, res) => {
  try {
    const { From, Body } = req.body;

    if (!From || !Body) {
      return res.status(400).send('Invalid SMS data.');
    }

    console.log(`📥 Incoming SMS from ${From}: ${Body}`);

    // Save to database
    await SMS.create({ from: From, body: Body });

    // Emit to frontend
    req.io.emit('incoming_sms', { from: From, body: Body });

    const twiml = new MessagingResponse();
    res.type('text/xml').send(twiml.toString());

  } catch (error) {
    console.error('[RECEIVE SMS ERROR]', error);
    res.status(500).send('Internal Server Error');
  }
};