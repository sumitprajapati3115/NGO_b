const Member = require('../models/Member');
const getNextSequence = require('./getNextSequence');

const generateCertificateNumber = async () => {
  const year = new Date().getFullYear();
  let sequence = await getNextSequence('certificateNumber');

  const latestMemberWithCert = await Member.findOne({
    certificateNumber: new RegExp(`^SRYF-CERT-${year}-\\d{5}$`),
  })
    .sort({ certificateNumber: -1 })
    .select('certificateNumber')
    .lean();

  if (latestMemberWithCert && latestMemberWithCert.certificateNumber) {
    const currentMax = parseInt(latestMemberWithCert.certificateNumber.slice(-5), 10);
    if (!Number.isNaN(currentMax) && sequence <= currentMax) {
      sequence = currentMax + 1;
    }
  }

  return `SRYF-CERT-${year}-${String(sequence).padStart(5, '0')}`;
};

module.exports = generateCertificateNumber;