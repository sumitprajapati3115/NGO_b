const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  skills: [{ type: String }],
  availability: { type: String },
  status: { type: String, enum: ['pending', 'active', 'inactive'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);
