const { sendSMS } = require('../services/smsService');

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
  const { From, Body } = req.body;
  await smsService.processIncomingSMS(From, Body);

  req.io.emit('incoming_sms', { from: From, body: Body });
  
  res.set('Content-Type', 'text/xml');
  res.send(`
    <Response>
      <Message>Thanks! We received: "${Body}"</Message>
    </Response>
  `);
};