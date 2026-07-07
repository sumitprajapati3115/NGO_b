const Team = require('../models/Team');
const { error } = require('../utils/response');

// @desc    Get public team member list
// @route   GET /api/team
// @access  Public
const getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await Team.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    return res.status(200).json(teamMembers);
  } catch (err) {
    console.error(err);
    return error(res, 'Server error while fetching team members.');
  }
};

module.exports = {
  getTeamMembers,
};
