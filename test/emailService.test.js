const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveEmailProvider } = require('../src/utils/emailService');

test('prefers SMTP when SMTP credentials are configured even if a BREVO API key is present', () => {
  const provider = resolveEmailProvider({
    email: {
      host: 'smtp-relay.brevo.com',
      port: '587',
      user: 'test@smtp-brevo.com',
      pass: 'smtp-key',
      brevoApiKey: 'smtp-key',
    },
  });

  assert.equal(provider, 'smtp');
});

test('uses Brevo API when SMTP credentials are not configured but a BREVO API key is present', () => {
  const provider = resolveEmailProvider({
    email: {
      host: '',
      port: '',
      user: '',
      pass: '',
      brevoApiKey: 'api-key',
    },
  });

  assert.equal(provider, 'brevo-api');
});
