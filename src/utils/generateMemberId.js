const getNextSequence = require('./getNextSequence');

/**
 * SRYF-TYPE-YEAR-SEQ प्रारूप में एक नई अनुक्रमिक सदस्य आईडी बनाता है।
 * उदा., SRYF-AM-2026-000001
 * @param {string} membershipPlan - सदस्य की योजना ('free' या 'active')।
 * @returns {Promise<string>} जेनरेट की गई सदस्य आईडी।
 */
const generateMemberId = async (membershipPlan) => {
  const year = new Date().getFullYear();
  const sequence = await getNextSequence('memberId');
  const paddedSequence = String(sequence).padStart(6, '0');
  const type = membershipPlan === 'free' ? 'FM' : 'AM';
  return `SRYF-${type}-${year}-${paddedSequence}`;
};

module.exports = generateMemberId;