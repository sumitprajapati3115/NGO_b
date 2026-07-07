const Member = require('../models/Member');
const generateMemberId = require('../utils/generateMemberId');
const generateCertificateNumber = require('../utils/generateCertificateNumber');
const { generateCertificatePdf } = require('../utils/certificateGenerator');
const { sendEmail } = require('../utils/emailService');
const { success, error } = require('../utils/response');
const cloudinary = require('../config/cloudinary');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');

const saveMemberWithCertificateRetry = async (member, retries = 3) => {
  try {
    return await member.save();
  } catch (err) {
    if (
      err.code === 11000 &&
      err.keyPattern &&
      err.keyPattern.certificateNumber &&
      retries > 0
    ) {
      member.certificateNumber = await generateCertificateNumber();
      return saveMemberWithCertificateRetry(member, retries - 1);
    }
    throw err;
  }
};

// @desc    Create a new member from the public membership form
// @route   POST /api/members
// @access  Public
const createMember = async (req, res) => {
  try {
    const { 
      fullName, email, phone, mobile, address, city, state, zipCode, membershipPlan = 'free', 
      paymentAmount: rawPaymentAmount, amount, fatherName, dob, gender, occupation, bloodGroup,
      modeOfPayment, transactionId, bankName, paymentScreenshot 
    } = req.body;
    const paymentAmount = rawPaymentAmount ?? amount;

    const phoneNumber = phone || mobile;
    if (!phoneNumber) {
      return error(res, 'Phone number is required.', 400);
    }

    // Check if a member with the same email already exists (case-insensitive)
    const existingMember = email ? await Member.findOne({ email: email.toLowerCase() }) : null;
    if (existingMember) {
      return error(res, `An account with the email "${email}" already exists. Please use a different email.`, 409);
    }

    const memberId = await generateMemberId(membershipPlan);

    const newMember = new Member({
      memberId,
      fullName,
      email,
      phone: phoneNumber,
      address,
      city: city || '',
      state: state || '',
      zipCode: zipCode || '',
      membershipPlan,
      status: membershipPlan === 'free' ? 'Active' : 'Pending',
      fatherName,
      dob,
      gender,
      occupation,
      bloodGroup,
      modeOfPayment,
      transactionId,
      bankName,
    });

    // For free members, generate a certificate number immediately.
    if (newMember.membershipPlan === 'free') {
      newMember.certificateNumber = await generateCertificateNumber();
    }

    if (membershipPlan !== 'free') {
      if (!paymentAmount) {
        return error(res, 'Payment amount is required for a paid membership.', 400);
      }
      newMember.paymentAmount = paymentAmount;

      if (paymentScreenshot) {
        try {
          const uploadedResponse = await cloudinary.uploader.upload(paymentScreenshot, {
            folder: 'members',
          });
          newMember.paymentScreenshot = {
            public_id: uploadedResponse.public_id,
            url: uploadedResponse.secure_url
          };
        } catch (uploadError) {
          console.error('Cloudinary Upload Error:', uploadError.message);
          const errorMessage = process.env.NODE_ENV === 'development'
            ? `Failed to upload payment screenshot: ${uploadError.message}`
            : 'Failed to upload payment screenshot. Please try again or contact support.';
          return error(res, errorMessage, 500);
        }
      }
    }

    await saveMemberWithCertificateRetry(newMember);

    // निःशुल्क सदस्य के लिए, तुरंत प्रमाण पत्र लिंक भेजें
    if (newMember.status === 'Active' && newMember.membershipPlan === 'free') {
      try {
        // The link must point to the backend server to generate the certificate.
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        const certificateLink = `${backendUrl}/api/certificates/preview/${newMember._id}`;
        await sendEmail({
          to: newMember.email,
          subject: 'Welcome to Shri Ram Youth Foundation!',
          template: 'membershipApproved.html', // Using unified template
          context: {
            fullName: newMember.fullName,
            certificateNumber: newMember.certificateNumber, // Send certificate number for free members
            certificateLink: certificateLink,
            isFree: true,
          },
        });
      } catch (emailError) {
        console.error('\n--- Email Sending Failed ---');
        console.error('Failed to send welcome email to member:', newMember.email);
        console.error('Error Details:', emailError);
        console.error('--------------------------\n');
      }
    }

    // व्यवस्थापक को एक सूचना ईमेल भेजें
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: 'New Membership Application Received - Shri Ram Youth Foundation',
          template: 'newMemberAdminNotification.html',
          context: {
            fullName: newMember.fullName,
            email: newMember.email,
            memberId: newMember.memberId,
          },
        });
      } else {
        console.warn('ADMIN_EMAIL is not set in .env file. Skipping new member notification.');
      }
    } catch (emailError) {
      console.error('\n--- Admin Email Sending Failed ---');
      console.error('Failed to send admin notification email to:', process.env.ADMIN_EMAIL);
      console.error('Error Details:', emailError);
      console.error('--------------------------------\n');
      // ईमेल भेजने में विफलता के कारण मुख्य ऑपरेशन को विफल न करें
    }

    return success(res, { message: 'Membership application submitted successfully!', member: newMember }, 201);
  } catch (err) {
    console.error(err);
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return error(res, messages.join(', '), 400);
    }
    return error(res, 'Server error while creating member.');
  }
};

// @desc    Get all members for the admin dashboard
// @route   GET /api/members
// @access  Private/Admin
const getAllMembers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const query = {};

    // नाम, ईमेल, फ़ोन या सदस्य आईडी द्वारा खोजने की कार्यक्षमता
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // 'i' केस-इनसेंसिटिव के लिए
      query.$or = [
        { fullName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { phone: { $regex: searchRegex } },
        { memberId: { $regex: searchRegex } },
      ];
    }

    // स्थिति (status) के अनुसार फ़िल्टर करें
    if (status && status !== 'All') {
      query.status = status;
    }

    // सबसे नए के अनुसार सॉर्ट करना
    const totalDocs = await Member.countDocuments(query);
    const members = await Member.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    return res.status(200).json({
      docs: members,
      totalDocs,
      limit: Number(limit),
      page: Number(page),
      totalPages: Math.ceil(totalDocs / limit),
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Server error while fetching members.');
  }
};

// @desc    Get a single member by ID
// @route   GET /api/members/:id
// @access  Private/Admin
const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return error(res, 'Member not found', 404);
    }

    return res.status(200).json(member);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return error(res, 'Member not found', 404);
    }
    return error(res, 'Server error while fetching member.');
  }
};

// @desc    Update a member's details
// @route   PUT /api/members/:id
// @access  Private/Admin
const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const memberToUpdate = await Member.findById(id);
    if (!memberToUpdate) {
        return error(res, 'Member not found.', 404);
    }

    // If membershipPlan is changing, update the memberId prefix
    if (updates.membershipPlan && updates.membershipPlan !== memberToUpdate.membershipPlan) {
        const currentId = memberToUpdate.memberId;
        const parts = currentId.split('-');
        if (parts.length === 4 && parts[0] === 'SRYF') { // SRYF-TYPE-YEAR-SEQ
            const newType = updates.membershipPlan === 'free' ? 'FM' : 'AM';
            updates.memberId = `SRYF-${newType}-${parts[2]}-${parts[3]}`;
        }
    }

    if (updates.mobile && !updates.phone) {
      updates.phone = updates.mobile;
    }

    if (updates.phone && !updates.mobile) {
      updates.mobile = updates.phone;
    }

    const allowedFields = [
      'fullName',
      'email',
      'phone',
      'mobile',
      'address',
      'city',
      'state',
      'zipCode',
      'membershipPlan',
      'status',
      'fatherName',
      'gender',
      'dob',
      'bloodGroup',
      'occupation',
      'memberId',
      'paymentAmount',
    ];

    const sanitizedUpdates = {};
    allowedFields.forEach((field) => {
      // Use hasOwnProperty for a more robust check and allow clearing fields with an empty string
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        sanitizedUpdates[field] = updates[field];
      }
    });

    if (sanitizedUpdates.email) {
      sanitizedUpdates.email = sanitizedUpdates.email.toLowerCase();
    }

    const member = await Member.findByIdAndUpdate(id, sanitizedUpdates, {
      new: true,
      runValidators: true,
    });

    if (!member) {
      return error(res, 'Member not found.', 404);
    }

    return success(res, { message: 'Member updated successfully.', member });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((val) => val.message);
      return error(res, messages.join(', '), 400);
    }
    return error(res, 'Server error while updating member.');
  }
};

// @desc    Update a member's status (Approve/Reject)
// @route   PATCH /api/members/:id/status
// @access  Private/Admin
const updateMemberStatus = async (req, res) => {
  try {
    const { status, membershipPlan } = req.body;
    const { id } = req.params;

    // स्थिति को मान्य करें
    if (!['Active', 'Pending'].includes(status)) {
      return error(res, 'Invalid status. Only "Active" or "Pending" are allowed.', 400);
    }
    
    const member = await Member.findById(id);

    if (!member) {
      return error(res, 'Member not found.', 404);
    }

    const oldStatus = member.status;
    member.status = status;

    if (membershipPlan) {
      member.membershipPlan = membershipPlan;
    }

    // पहली बार भुगतान करने वाले सदस्य को स्वीकृत करते समय प्रमाणपत्र क्रमांक बनाएं
    if (status === 'Active' && oldStatus === 'Pending' && member.membershipPlan !== 'free' && !member.certificateNumber) {
        member.certificateNumber = await generateCertificateNumber();
    }

    await member.save();

    // सदस्य को स्थिति के आधार पर एक ईमेल भेजें
    try {
      if (status === 'Active' && oldStatus === 'Pending') {
        // केवल भुगतान करने वाले सदस्यों को अनुमोदन पर प्रमाण पत्र भेजें
        if (member.membershipPlan === 'free') {
            return success(res, { message: 'Member status updated successfully!', member });
        }

        // The link must point to the backend server to generate the certificate.
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        const certificateLink = `${backendUrl}/api/certificates/preview/${member._id}`;

        await sendEmail({
          to: member.email,
          subject: 'Welcome to Shri Ram Youth Foundation - Your Membership is Approved!',
          template: 'membershipApproved.html', // Using unified template
          context: {
            fullName: member.fullName,
            memberId: member.memberId,
            certificateNumber: member.certificateNumber,
            certificateLink: certificateLink,
            isFree: false,
          },
        });

      }
    } catch (emailError) {
      console.error('\n--- Status Update Email Sending Failed ---');
      console.error('Failed to send status update email to member:', member.email);
      console.error('Error Details:', emailError);
      console.error('----------------------------------------\n');
      // ईमेल भेजने में विफलता के कारण मुख्य ऑपरेशन को विफल न करें
    }

    return success(res, { message: 'Member status updated successfully!', member });
  } catch (err) {
    console.error(err);
    return error(res, 'Server error while updating member status.');
  }
};

// @desc    Delete a member
// @route   DELETE /api/members/:id
// @access  Private/Admin
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return error(res, 'Member not found.', 404);
    }

    await Member.findByIdAndDelete(req.params.id);

    return success(res, { message: 'Member removed successfully.' });
  } catch (err) {
    console.error(err);
    return error(res, 'Server error while deleting member.');
  }
};

// @desc    Preview a member's certificate, using the correct template
// @route   GET /api/certificates/preview/:id
// @access  Public
const previewCertificate = async (req, res) => {
    try {
        const member = await Member.findById(req.params.id).lean();
        if (!member) {
            return res.status(404).send('<h1>Member not found</h1>');
        }

        // Use the 'certificate.html' template as requested.
        const templatePath = path.join(__dirname, '../templates/certificate.html');
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(templateSource);

        // Read and encode logo to base64 using a robust path
        let logoBase64 = '';
        const logoPath = path.resolve(process.cwd(), 'src', 'assets', 'image', 'logo.png');

        try {
            if (fs.existsSync(logoPath)) {
                const logoBuffer = fs.readFileSync(logoPath);
                logoBase64 = logoBuffer.toString('base64');
                console.log('✓ Logo loaded successfully from:', logoPath);
            } else {
                console.warn('⚠ WARNING: Logo file not found at:', logoPath);
            }
        } catch (e) {
            console.error('Error loading logo for preview:', e);
        }

        const context = {
            member_id_for_download: member._id.toString(),
            member_name: member.fullName,
            membership_id: member.memberId,
            certificate_id: member.certificateNumber,
            issue_date: new Date(member.createdAt).toLocaleDateString('hi-IN'),
            signatory_name: 'अभिजीत सिंह सांगा',
            signatory_title: 'विधायक वर्ग',
            isPaidMember: member.membershipPlan === 'active',
            logo_base_64: logoBase64,
            is_preview: true
        };

        const html = template(context);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);

    } catch (err) {
        console.error('Failed to generate certificate preview:', err);
        res.status(500).send('<h1>Error generating certificate preview.</h1>');
    }
};

// @desc    Download a member's certificate as PDF
// @route   GET /api/certificates/download/:id
// @access  Public
const downloadCertificate = async (req, res) => {
    let browser;
    let pdfPath; // PDF के जेनरेट किए गए पाथ को होल्ड करने के लिए

    try {
        const member = await Member.findById(req.params.id).lean();
        if (!member) {
            return res.status(404).send('<h1>Member not found</h1>');
        }

        const templatePath = path.join(__dirname, '../templates/certificate.html');
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(templateSource);

        // Read and encode logo to base64 using a robust path
        let logoBase64 = '';
        const logoPath = path.resolve(process.cwd(), 'src', 'assets', 'image', 'logo.png');

        try {
            if (fs.existsSync(logoPath)) {
                const logoBuffer = fs.readFileSync(logoPath);
                logoBase64 = logoBuffer.toString('base64');
                console.log('✓ PDF Gen: Logo loaded successfully from:', logoPath);
            } else {
                console.warn('⚠ WARNING: Logo file not found for PDF generation at:', logoPath);
            }
        } catch (e) {
            console.error('Error loading logo for PDF generation:', e);
        }

        const context = {
            member_name: member.fullName,
            membership_id: member.memberId,
            certificate_id: member.certificateNumber,
            issue_date: new Date(member.createdAt).toLocaleDateString('hi-IN'),
            signatory_name: 'अभिजीत सिंह सांगा',
            signatory_title: 'विधायक वर्ग',
            isPaidMember: member.membershipPlan === 'active',
            logo_base_64: logoBase64,
            // is_preview is false/undefined, so download button won't be in PDF
        };

        const html = template(context);

        browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });

        const page = await browser.newPage();

        // 1. setContent का उपयोग करें और नेटवर्क के शांत होने की प्रतीक्षा करें
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // 2. वेब फोंट और अन्य स्टाइल के पूरी तरह से रेंडर होने के लिए एक छोटा सा अतिरिक्त विलंब जोड़ें
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 3. एक पाथ परिभाषित करें और PDF को एक फाइल में सेव करें
        const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'certificates');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        pdfPath = path.join(uploadsDir, `cert-${member.memberId}-${Date.now()}.pdf`);

        await page.pdf({
            path: pdfPath,
            width: '1080px',
            height: '764px',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });

        await browser.close();
        browser = null;

        // 4. फाइल भेजने के लिए res.download का उपयोग करें और बाद में उसे हटा दें
        res.download(pdfPath, `sryf_certificate_${member.memberId}.pdf`, (err) => {
            if (err) console.error('Error during file download:', err);
            
            fs.unlink(pdfPath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting temporary PDF file:', unlinkErr);
            });
        });
    } catch (err) {
        console.error('Failed to generate or send certificate PDF:', err);
        if (!res.headersSent) {
            res.status(500).send('<h1>Error generating certificate PDF.</h1>');
        }
    } finally {
        if (browser) {
            await browser.close();
        }
        // यदि res.download से पहले कोई त्रुटि होती है, तो बची हुई फाइल को हटा दें
        if (pdfPath && fs.existsSync(pdfPath) && !res.headersSent) {
            fs.unlink(pdfPath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting leftover temp PDF on error:', unlinkErr);
            });
        }
    }
};

module.exports = {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  updateMemberStatus,
  deleteMember,
  previewCertificate,
  downloadCertificate
};