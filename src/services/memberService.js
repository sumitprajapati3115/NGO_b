const Member = require('../models/Member');

const createMember = async (memberData) => {
  const member = new Member(memberData);
  return member.save();
};

const listMembers = async (query = {}) => {
  return Member.find(query).sort({ createdAt: -1 });
};

module.exports = {
  createMember,
  listMembers,
};
