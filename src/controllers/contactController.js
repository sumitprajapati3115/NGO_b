const Contact = require('../models/Contact');
const { success, error } = require('../utils/response');
const { sendEmail } = require('../utils/emailService');

// @desc    Submit a contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message, mobile } = req.body;

    if (!name || !email || !subject || !message) {
      return error(res, 'Please fill in all fields.', 400);
    }

    const newContact = new Contact({
      name,
      email,
      subject,
      message,
      mobile,
      status: 'new',
    });

    await newContact.save();

    // Notify admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: `New Contact Message: ${newContact.subject}`,
          template: 'newContactAdminNotification.html',
          context: {
            name: newContact.name,
            email: newContact.email,
            subject: newContact.subject,
            message: newContact.message,
            mobile: newContact.mobile || 'N/A',
          },
        });
      }
    } catch (emailError) {
      console.error('Failed to send new contact admin notification:', emailError);
    }

    return success(res, { message: 'Your message has been sent successfully. We will get back to you shortly.' }, 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Server error while submitting contact form.');
  }
};

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private/Admin
const getContacts = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { subject: { $regex: searchRegex } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const totalDocs = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    return res.status(200).json({
      docs: contacts,
      totalDocs,
      limit: Number(limit),
      page: Number(page),
      totalPages: Math.ceil(totalDocs / limit),
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Server error while fetching contacts.');
  }
};

// @desc    Get a single contact submission by ID
// @route   GET /api/contact/:id
// @access  Private/Admin
const getContactById = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return error(res, 'Contact message not found.', 404);
        }

        // Mark as read if it's new
        if (contact.status === 'new') {
            contact.status = 'read';
            await contact.save();
        }

        return res.status(200).json(contact);
    } catch (err) {
        console.error(err);
        return error(res, 'Server error while fetching contact message.');
    }
};

// @desc    Update contact status
// @route   PATCH /api/contact/:id/status
// @access  Private/Admin
const updateContactStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const contact = await Contact.findById(req.params.id);

        if (!contact) return error(res, 'Contact message not found.', 404);
        if (!['new', 'read', 'closed'].includes(status)) return error(res, 'Invalid status.', 400);

        contact.status = status;
        await contact.save();
        return success(res, { message: 'Status updated successfully.', contact });
    } catch (err) {
        console.error(err);
        return error(res, 'Server error while updating status.');
    }
};

// @desc    Delete a contact submission
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            return error(res, 'Contact message not found.', 404);
        }
        return success(res, { message: 'Contact message deleted successfully.' });
    } catch (err) {
        console.error(err);
        return error(res, 'Server error while deleting contact message.');
    }
};

module.exports = {
  submitContact,
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
};
