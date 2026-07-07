const transporter = require('../config/email');

const sendEmail = async ({ to, subject, html }) => {
  const message = {
    from: process.env.EMAIL_FROM || transporter.options.auth.user,
    to,
    subject,
    html,
  };

  return transporter.sendMail(message);
};

module.exports = {
  sendEmail,
};
