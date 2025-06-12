const Voice = require('../models/Voice');
const twilio = require('twilio');
const { VoiceResponse } = twilio.twiml;

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

exports.makeCall = async (req, res) => {
  try {
    const { to } = req.body;
    const call = await client.calls.create({
      url: `${process.env.BASE_URL}/api/voice/voice-response`,
      to,
      from: process.env.TWILIO_PHONE
    });

    await Voice.create({
      callSid: call.sid,
      from: process.env.TWILIO_PHONE,
      to,
      direction: 'outbound',
      status: call.status
    });

    res.status(200).json({ message: 'Call initiated', sid: call.sid });
  } catch (err) {
    console.error('[MAKE CALL ERROR]', err);
    res.status(500).json({ error: 'Call failed' });
  }
};

exports.voiceWebhook = async (req, res) => {
  const { CallSid, From, To, CallStatus, Direction, Duration } = req.body;
  const twiml = new VoiceResponse();

  if (Direction === 'inbound') {
    twiml.say('Hello! This is the Omni-Channel Communication App. Please wait while we connect you.');
    twiml.pause({ length: 2 });
    twiml.say('Thank you for calling.');
  }

  await Voice.findOneAndUpdate(
    { callSid: CallSid },
    {
      callSid: CallSid,
      from: From,
      to: To,
      direction: Direction || 'inbound',
      status: CallStatus,
      duration: Duration
    },
    { upsert: true, new: true }
  );

  res.type('text/xml').send(twiml.toString());
};

exports.getCallHistory = async (req, res) => {
  try {
    const calls = await Voice.find().sort({ timestamp: -1 });
    res.status(200).json(calls);
  } catch (err) {
    console.error('[GET CALL HISTORY ERROR]', err);
    res.status(500).json({ error: 'Unable to fetch call logs' });
  }
};
