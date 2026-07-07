const express = require('express');
const router = express.Router();
const { createMember, getAllMembers, getMemberById, updateMember, updateMemberStatus, deleteMember } = require('../controllers/memberController');
const { protect, admin } = require('../middleware/authMiddleware');

// POST /api/members - नए सदस्य आवेदनों के लिए पब्लिक रूट
router.post('/', createMember);

// GET /api/members - एडमिन के लिए सभी सदस्यों को देखने के लिए प्राइवेट रूट
// अब यह रूट सुरक्षित है और केवल प्रमाणित एडमिन ही इसे एक्सेस कर सकते हैं।
router.get('/', protect, admin, getAllMembers);

// GET /api/members/:id - एडमिन द्वारा एक सदस्य की विस्तृत जानकारी देखने के लिए
router.get('/:id', protect, admin, getMemberById);

// PUT /api/members/:id - एडमिन द्वारा सदस्य विवरण अपडेट करने के लिए
router.put('/:id', protect, admin, updateMember);

// PATCH /api/members/:id/status - एडमिन द्वारा सदस्य की स्थिति अपडेट करने के लिए
router.patch('/:id/status', protect, admin, updateMemberStatus);

// DELETE /api/members/:id - एडमिन द्वारा सदस्य को हटाने के लिए
router.delete('/:id', protect, admin, deleteMember);

module.exports = router;