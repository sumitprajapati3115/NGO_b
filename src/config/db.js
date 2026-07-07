const mongoose = require('mongoose');

const connectDB = async () => {
  // process.env.MONGO_URI should be loaded from your config/config.env file
  // by the server's entry point (server.js).
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('FATAL ERROR: MONGO_URI is not defined in your environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
