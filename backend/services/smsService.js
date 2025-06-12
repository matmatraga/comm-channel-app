const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

exports.sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: twilioNumber,
      to,
    });
    return result;
  } catch (err) {
    console.error('[SMS ERROR]', err);
    throw err;
  }
};

exports.processIncomingSMS = async (from, body) => {
  console.log(`[📥 SMS RECEIVED] From: ${from} | Message: ${body}`);
  // You can store this in the DB or broadcast via socket.io here
};