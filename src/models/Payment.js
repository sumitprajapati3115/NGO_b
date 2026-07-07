const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  donorEmail: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['upi', 'bank_transfer', 'card', 'cash', 'other'], default: 'other' },
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  referenceId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
