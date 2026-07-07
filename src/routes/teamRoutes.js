const express = require('express');
const router = express.Router();
const { getTeamMembers } = require('../controllers/teamController');

// GET /api/team - Public team member listing
router.get('/', getTeamMembers);

module.exports = router;
