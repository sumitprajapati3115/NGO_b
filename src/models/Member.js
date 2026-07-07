const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    memberId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    fatherName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String },
    bloodGroup: { type: String },
    occupation: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    membershipPlan: { type: String, enum: ['free', 'active'], default: 'free' },
    status: { type: String, enum: ['Active', 'Pending'], default: 'Pending' },
    paymentAmount: { type: Number },
    modeOfPayment: { type: String },
    transactionId: { type: String },
    bankName: { type: String },
    paymentScreenshot: {
        public_id: { type: String },
        url: { type: String }
    },
    certificateNumber: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.Member || mongoose.model('Member', memberSchema);