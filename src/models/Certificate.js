const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const certificateSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
  },
  certificateId: {
    type: String,
    required: true,
    default: () => `SRYF-CERT-${nanoid(10)}`,
    unique: true,
  },
  recipientName: {
    type: String,
    default: 'Recipient',
  },
  title: {
    type: String,
    required: true,
    default: 'Certificate of Appreciation',
  },
  description: {
    type: String,
    default: '',
  },
  fileUrl: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['issued', 'draft'],
    default: 'issued',
  },
  template: {
    type: String,
    enum: ['classic', 'modern'],
    default: 'classic',
  },
  issuedDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);