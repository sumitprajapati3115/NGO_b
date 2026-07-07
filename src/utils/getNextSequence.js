const Counter = require('../models/Counter');

/**
 * दिए गए काउंटर नाम के लिए अगली अनुक्रम संख्या प्राप्त करता है।
 * @param {string} name - काउंटर का नाम (जैसे, 'memberId')।
 * @returns {Promise<number>} अगली अनुक्रम संख्या।
 */
async function getNextSequence(name) {
  const counter = await Counter.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return counter.seq;
}

module.exports = getNextSequence;