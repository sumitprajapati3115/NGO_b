const Razorpay = require('razorpay');
const { razorpay } = require('./env');

const razorpayClient = new Razorpay({
  key_id: razorpay.keyId || '',
  key_secret: razorpay.keySecret || '',
});

module.exports = razorpayClient;
