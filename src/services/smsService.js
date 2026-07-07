const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const sendSms = async ({ to, body }) => {
  if (!accountSid || !authToken || !fromPhone) {
    throw new Error('Twilio credentials are not configured in environment variables.');
  }

  return client.messages.create({
    body,
    from: fromPhone,
    to,
  });
};

module.exports = {
  sendSms,
};
