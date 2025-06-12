const Voice = require('../models/Voice');
const twilio = require('twilio');
const { VoiceResponse } = twilio.twiml;

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

exports.makeCall = async (req, res) => {
  try {
    const { to } = req.body;
    console.log('📞 Outbound call request body:', req.body);
    const call = await client.calls.create({
      url: `https://omni-channel-app.onrender.com/api/voice/voice-response`,
      to,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    await Voice.create({
      callSid: call.sid,
      from: process.env.TWILIO_PHONE_NUMBER,
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
    const dial = twiml.dial();
    dial.client('token'); // This must match identity in frontend token
  } else {
    twiml.say('Thank you for using the Omni-Channel Communication App.');
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

exports.generateToken = (req, res) => {
  const { identity } = req.query;

  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { identity }
  );

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
    incomingAllow: true
  });

  token.addGrant(voiceGrant);
  res.send({ token: token.toJwt() });
};