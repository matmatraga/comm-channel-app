const Voice = require("../models/Voice");
const twilio = require("twilio");
const AccessToken = twilio.jwt.AccessToken;
const { VoiceGrant } = twilio.jwt.AccessToken;
const { VoiceResponse } = twilio.twiml;

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
console.log(client);
console.log(process.env.TWILIO_TWIML_APP_SID);

exports.makeCall = async (req, res) => {
  try {
    const { to } = req.body;
    console.log("📞 Outbound call request body:", req.body);

    const isPhoneNumber = /^\+?\d+$/.test(to); // crude check for phone number

    const callParams = {
      url: `https://omni-channel-app.onrender.com/api/voice/voice-response?to=${encodeURIComponent(
        to
      )}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: isPhoneNumber ? to : `client:${to}`, // Handle either identity or phone
    };

    const call = await client.calls.create(callParams);

    await Voice.create({
      callSid: call.sid,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: callParams.to,
      direction: "outbound",
      status: call.status,
    });

    res.status(200).json({ message: "Call initiated", sid: call.sid });
  } catch (err) {
    console.error("[MAKE CALL ERROR]", err);
    res.status(500).json({ error: "Call failed" });
  }
};

exports.voiceWebhook = async (req, res) => {
  console.log("[VOICE WEBHOOK HIT]", req.body);

  const { CallSid, From, To, CallStatus, Direction, Duration } = req.body;
  const identity = req.query.to || "anonymous";
  const twiml = new VoiceResponse();

  if (Direction === "inbound") {
    const dial = twiml.dial();
    dial.client(identity);
  } else {
    twiml.say("Thank you for using the Omni-Channel Communication App.");
  }

  const existingCall = await Voice.findOne({ callSid: CallSid });

  const updatedData = {
    callSid: CallSid,
    from: From,
    to: To || `client:${identity}`,
    direction: Direction || "inbound",
    status: CallStatus,
    duration: Duration || existingCall?.duration || 0,
    timestamp: existingCall?.timestamp || new Date(),
  };

  await Voice.findOneAndUpdate({ callSid: CallSid }, updatedData, {
    upsert: true,
    new: true,
  });

  res.type("text/xml").send(twiml.toString());
};

exports.getCallHistory = async (req, res) => {
  try {
    const calls = await client.calls.list({ limit: 20 });

    const formatted = calls.map((call) => ({
      callSid: call.sid,
      from: call.from,
      to: call.to,
      status: call.status,
      direction: call.direction,
      duration: call.duration,
      timestamp: call.startTime,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("[GET CALL HISTORY ERROR]", err);
    res.status(500).json({ error: "Unable to fetch call logs" });
  }
};

exports.getToken = async (req, res) => {
  try {
    const { identity } = req.query;

    if (!identity) {
      return res.status(400).json({ error: "Missing identity" });
    }

    const accessToken = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { identity }
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
      incomingAllow: true,
    });

    accessToken.addGrant(voiceGrant);

    const jwt = accessToken.toJwt();
    res.json({ token: jwt });
  } catch (err) {
    console.error("❌ [TOKEN GENERATION ERROR]", err);
    res.status(500).send("Internal Server Error");
  }
};
