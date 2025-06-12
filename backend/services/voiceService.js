const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

if (!twilioNumber) {
  console.error('❌ TWILIO_PHONE_NUMBER is not defined in environment variables!');
}

exports.makeCall = async (to, twimlUrl) => {
  if (!to || !twimlUrl || !twilioNumber) {
    throw new Error('Missing required parameters: to, from, or url.');
  }

  return client.calls.create({
    to,
    from: twilioNumber,
    url: twimlUrl,
    statusCallback: `https://omni-channel-app.onrender.com/api/voice/status`,
    statusCallbackEvent: ['completed']
  });
};
