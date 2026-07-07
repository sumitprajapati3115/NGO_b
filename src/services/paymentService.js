const Razorpay = require('../config/razorpay');

const createOrder = async ({ amount, currency = 'INR', receipt }) => {
  const options = {
    amount: Math.round(amount * 100),
    currency,
    receipt,
    payment_capture: 1,
  };

  return Razorpay.orders.create(options);
};

module.exports = {
  createOrder,
};
