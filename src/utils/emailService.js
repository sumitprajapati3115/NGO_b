const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs/promises');
const path = require('path');
const config = require('../config/env');

const resolveEmailProvider = (runtimeConfig = config) => {
  const emailConfig = runtimeConfig.email || {};
  const hasSmtpConfig = Boolean(emailConfig.host && emailConfig.port && emailConfig.user && emailConfig.pass);

  if (hasSmtpConfig) {
    return 'smtp';
  }

  if (emailConfig.brevoApiKey) {
    return 'brevo-api';
  }

  return null;
};

/**
 * Send email using SMTP when configured, otherwise fall back to the Brevo API.
 * @param {object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.template
 * @param {object} options.context
 * @param {Array} [options.attachments]
 */
const sendEmail = async (options) => {
  const templatePath = path.join(__dirname, '..', 'templates', options.template);
  const htmlTemplate = await fs.readFile(templatePath, 'utf-8');
  const template = handlebars.compile(htmlTemplate);
  const html = template(options.context);

  const fromAddress = config.email.from || process.env.EMAIL_FROM;
  if (!fromAddress) {
    throw new Error('EMAIL_FROM is not configured for outgoing email');
  }

  const provider = resolveEmailProvider();

  if (provider === 'brevo-api') {
    const brevoPayload = {
      sender: {
        name: 'Shri Ram Youth Foundation',
        email: fromAddress,
      },
      to: [{ email: options.to }],
      subject: options.subject,
      htmlContent: html,
      textContent: 'Please use an HTML-compatible client to view this email.',
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.email.brevoApiKey,
      },
      body: JSON.stringify(brevoPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API failed with status ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  if (!config.email.host || !config.email.port || !config.email.user || !config.email.pass) {
    throw new Error('SMTP email configuration is incomplete. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS or use BREVO_API_KEY.');
  }

  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: Number(config.email.port),
    secure: Number(config.email.port) === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  const mailOptions = {
    from: `Shri Ram Youth Foundation <${fromAddress}>`,
    to: options.to,
    subject: options.subject,
    html,
    text: 'Please use an HTML-compatible client to view this email.',
    attachments: options.attachments || [],
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail, resolveEmailProvider };