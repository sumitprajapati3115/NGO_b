const Admin = require('../models/Admin');

/**
 * @desc    Register a new admin user
 * @route   POST /api/admin/register
 * @access  Public (for initial setup, should be protected later)
 */
const registerAdmin = async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    try {
        // Check if an admin with this email already exists
        const adminExists = await Admin.findOne({ email });

        if (adminExists) {
            return res.status(409).json({ success: false, message: 'An admin with this email already exists.' });
        }

        // Create a new admin. The password will be hashed by the pre-save hook in the Admin model.
        const admin = await Admin.create({
            email,
            password,
            role, // 'admin' or 'superadmin'
        });

        res.status(201).json({ success: true, message: `Admin '${admin.email}' registered successfully.` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during admin registration.', error: error.message });
    }
};

module.exports = { registerAdmin };