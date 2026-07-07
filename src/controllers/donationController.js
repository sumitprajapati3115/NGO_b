const Donation = require('../models/Donation');
const { success, error } = require('../utils/response');
const cloudinary = require('../config/cloudinary');
const { sendEmail } = require('../utils/emailService');

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Public
const createDonation = async (req, res) => {
    try {
        const { fullName, email, mobile, donationAmount, method, screenshot, fileData, transactionId, bankName } = req.body;
        const screenshotPayload = screenshot || fileData;

        const newDonation = new Donation({
            fullName,
            email,
            mobile,
            donationAmount,
            method,
            status: 'Pending',
            transactionId,
            bankName,
        });

        if (screenshotPayload) {
            try {
                const uploadedResponse = await cloudinary.uploader.upload(screenshotPayload, {
                    folder: 'donations',
                });
                newDonation.screenshot = {
                    public_id: uploadedResponse.public_id,
                    url: uploadedResponse.secure_url,
                };
            } catch (uploadError) {
                console.error('Cloudinary Upload Error for Donation:', uploadError.message);
                return error(res, 'Failed to upload payment screenshot.', 500);
            }
        }

        await newDonation.save();

        try {
            const adminEmail = process.env.ADMIN_EMAIL;
            if (adminEmail) {
                await sendEmail({
                    to: adminEmail,
                    subject: 'New Donation Received - Shri Ram Youth Foundation',
                    template: 'newDonationAdminNotification.html',
                    context: {
                        fullName: newDonation.fullName,
                        amount: newDonation.donationAmount,
                    },
                });
            }
        } catch (emailError) {
            console.error('Failed to send admin notification for donation:', emailError);
        }

        return success(res, { message: 'Donation details submitted successfully. Thank you!', donation: newDonation }, 201);

    } catch (err) {
        console.error(err);
        return error(res, 'Server error while creating donation.');
    }
};

// @desc    Get all donations for the admin dashboard
// @route   GET /api/donations
// @access  Private/Admin
const getAllDonations = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      const trimmedSearch = search.trim();
      if (trimmedSearch) {
        const searchRegex = new RegExp(trimmedSearch.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
        query.$or = [
          { fullName: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
        ];
        const searchNumber = Number(trimmedSearch);
        if (!isNaN(searchNumber)) {
          query.$or.push({ donationAmount: searchNumber });
        }
      }
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const totalDocs = await Donation.countDocuments(query);
    const donations = await Donation.find(query).sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit));

    return res.status(200).json({
      docs: donations,
      totalDocs,
      limit: Number(limit),
      page: Number(page),
      totalPages: Math.ceil(totalDocs / limit),
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Server error while fetching donations.');
  }
};

// @desc    Get a single donation by ID
// @route   GET /api/donations/:id
// @access  Private/Admin
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return error(res, 'Donation not found', 404);
    return res.status(200).json(donation);
  } catch (err) {
    console.error(err);
    return error(res, 'Server error while fetching donation.');
  }
};

// @desc    Update a donation's status
// @route   PATCH /api/donations/:id/status
// @access  Private/Admin
const updateDonationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const donation = await Donation.findById(req.params.id);

        if (!donation) return error(res, 'Donation not found.', 404);
        if (!['Completed', 'Pending'].includes(status)) return error(res, 'Invalid status.', 400);

        donation.status = status;
        await donation.save();
        return success(res, donation);
    } catch (err) {
        console.error(err);
        return error(res, 'Server error while updating donation status.');
    }
};

module.exports = { createDonation, getAllDonations, getDonationById, updateDonationStatus };