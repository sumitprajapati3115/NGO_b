const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    mobile: { type: String },
    donationAmount: { type: Number, required: true },
    method: { type: String },
    status: { type: String, enum: ['Completed', 'Pending'], default: 'Pending' },
    screenshot: {
        public_id: { type: String },
        url: { type: String }
    },
    transactionId: { type: String },
    bankName: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.Donation || mongoose.model('Donation', donationSchema);