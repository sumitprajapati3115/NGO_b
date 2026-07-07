const nodemailer = require('nodemailer');
const { email } = require('./env');

const transporter = nodemailer.createTransport({
  host: email.host || 'smtp.example.com',
  port: Number(email.port) || 587,
  secure: false,
  auth: {
    user: email.user || 'example@example.com',
    pass: email.pass || 'examplepassword',
  },
});

module.exports = transporter;
