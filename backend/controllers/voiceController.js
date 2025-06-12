const Voice = require('../models/Voice');
const twilio = require('twilio');
const AccessToken  = twilio.jwt.AccessToken;
const { VoiceGrant } = twilio.jwt.AccessToken;
const { VoiceResponse } = twilio.twiml;

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
console.log(client);
console.log(process.env.TWILIO_TWIML_APP_SID)

exports.makeCall = async (req, res) => {
  try {
    const { to } = req.body;
    console.log('📞 Outbound call request body:', req.body);

    const isPhoneNumber = /^\+?\d+$/.test(to); // crude check for phone number

    const callParams = {
      url: `https://omni-channel-app.onrender.com/api/voice/voice-response?to=${encodeURIComponent(to)}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: isPhoneNumber ? to : `client:${to}`, // Handle either identity or phone
    };

    const call = await client.calls.create(callParams);

    await Voice.create({
      callSid: call.sid,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: callParams.to,
      direction: 'outbound',
      status: call.status,
    });

    res.status(200).json({ message: 'Call initiated', sid: call.sid });
  } catch (err) {
    console.error('[MAKE CALL ERROR]', err);
    res.status(500).json({ error: 'Call failed' });
  }
};


exports.voiceWebhook = async (req, res) => {
  console.log('[VOICE WEBHOOK HIT]', req.body);
  const { CallSid, From, To, CallStatus, Direction, Duration } = req.body;
  const identity = req.query.to || 'anonymous';
    console.log(identity);
  const twiml = new VoiceResponse();

  if (Direction === 'inbound') {
    const dial = twiml.dial();
    console.log(dial);
    dial.client(identity); // 🔥 dynamic identity routing
  } else {
    twiml.say('Thank you for using the Omni-Channel Communication App.');
  }

  // Save or update the voice call log
  await Voice.findOneAndUpdate(
    { callSid: CallSid },
    {
      callSid: CallSid,
      from: From,
      to: To || `client:${identity}`,
      direction: Direction || 'inbound',
      status: CallStatus,
      duration: Duration || 0,
      timestamp: new Date(),
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
  const identity = req.query.identity || 'anonymous';
  console.log('🔐 Generating Twilio Voice Token for:', identity);

  const accessToken = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { identity }
  );

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWIML_APP_SID,
    incomingAllow: true
  });

  accessToken.addGrant(voiceGrant);

  res.json({ token: accessToken.toJwt(), identity });
};