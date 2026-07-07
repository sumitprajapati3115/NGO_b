const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Fix for querySrv ECONNREFUSED error. Forces Node.js to use public DNS servers.
// This should be at the very top, before any other modules that might make network requests.
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load env vars from the root .env file. This must be done before any other imports
// that might rely on environment variables.
dotenv.config({ path: path.join(process.cwd(), '.env') });

const app = require('./app'); // Import the configured express app from app.js

// Connect to the database
const connectDB = require('./config/db');
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Close the process using it or set a different PORT in .env.`);
    process.exit(1);
  }
  console.error('Server failed to start:', err);
  process.exit(1);
});

// Optional but recommended: Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});