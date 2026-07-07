const { jwtSecret } = require('./env');

if (!jwtSecret) {
  throw new Error('JWT_SECRET must be defined in environment variables.');
}

module.exports = {
  secret: jwtSecret,
  expiresIn: '8h',
};
