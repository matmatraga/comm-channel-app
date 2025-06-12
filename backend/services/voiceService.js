const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

exports.makeCall = async (to, twimlUrl) => {
  return client.calls.create({
    to,
    from: twilioNumber,
    url: twimlUrl,      // TwiML instructions URL
    statusCallback: `${process.env.BASE_URL}/api/voice/status`,
    statusCallbackEvent: ['completed']
  });
};