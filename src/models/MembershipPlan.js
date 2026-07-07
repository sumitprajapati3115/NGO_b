const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  durationInMonths: { type: Number, required: true, default: 12 },
  benefits: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
