require('dotenv').config();
const nodemailer = require('nodemailer');

(async () => {
  console.log('--- Starting Email Test Script ---');
  console.log(`Attempting to send email from: ${process.env.EMAIL_FROM}`);
  console.log(`Attempting to send email to: ${process.env.ADMIN_EMAIL || process.env.EMAIL_FROM}`);
  console.log(`Using SMTP Host: ${process.env.EMAIL_HOST}`);

  const requiredEnv = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
  const missingEnv = requiredEnv.filter(v => !process.env[v]);

  if (missingEnv.length > 0) {
    console.error(`\n\x1b[31m[ERROR]\x1b[0m The following required environment variables are missing from your .env file: ${missingEnv.join(', ')}`);
    return process.exit(1);
  }

  if (process.env.EMAIL_PASS === 'YOUR_BREVO_SMTP_KEY') {
    console.error('\n\x1b[31m[ERROR]\x1b[0m EMAIL_PASS is a placeholder. Please paste your real Brevo SMTP Key into the .env file.');
    process.exit(1);
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Add this for better debugging
      debug: true,
      logger: true
    });

    console.log('\nTransporter created. Sending email...');

    const info = await transporter.sendMail({
      from: `SRYF Test <${process.env.EMAIL_FROM}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM,
      subject: 'Test email from local backend',
      text: 'This is a test email sent from test-send-email.js',
      html: '<p>This is a <b>test</b> email sent from <i>test-send-email.js</i></p>'
    });

    console.log('\n\x1b[32m--- SUCCESS! ---\x1b[0m');
    console.log('Message sent successfully.');
    console.log('Message ID:', info && info.messageId ? info.messageId : info);
    console.log('Please check your inbox (and spam folder) for the test email.');
    process.exit(0);
  } catch (err) {
    console.error('\n\x1b[31m--- FAILED TO SEND EMAIL ---\x1b[0m');
    console.error('Error Details:', err);
    console.error('\n\x1b[33mCommon Issues:\x1b[0m');
    console.error('1. \x1b[36mInvalid SMTP Key:\x1b[0m Make sure the EMAIL_PASS in your .env file is the correct Brevo SMTP Key.');
    console.error('2. \x1b[36mUnverified Sender:\x1b[0m The EMAIL_FROM address must be a verified sender in your Brevo account.');
    console.error('3. \x1b[36mNetwork/Firewall:\x1b[0m Your network might be blocking the connection to smtp-relay.brevo.com on port 587.');
    process.exit(1);
  }
})();