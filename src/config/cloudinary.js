const cloudinary = require('cloudinary').v2;
const { cloudinary: cloudConfig } = require('./env');

cloudinary.config({
  cloud_name: cloudConfig.cloudName,
  api_key: cloudConfig.apiKey,
  api_secret: cloudConfig.apiSecret,
});

module.exports = cloudinary;
