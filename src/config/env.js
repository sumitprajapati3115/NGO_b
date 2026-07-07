const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

const envPath = path.resolve(__dirname, '..', '..', '.env');
const cwdEnvPath = path.resolve(process.cwd(), '.env');

dotenv.config({ path: fs.existsSync(envPath) ? envPath : cwdEnvPath });

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'change_this_secret',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  fileUploadPath: process.env.FILE_UPLOAD_PATH || 'uploads',
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
    brevoApiKey: process.env.BREVO_API_KEY,
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },
};
