const Member = require('../models/Member');
const handlebars = require('handlebars');
const fs = require('fs/promises');
const path = require('path');
const { error } = require('../utils/response');
const { generateCertificatePdf } = require('../utils/certificateGenerator');

// @desc    Generate and download a membership certificate for a member
// @route   GET /api/certificates/member/:id
// @access  Private/Admin
const downloadCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findById(id);

    if (!member) {
      return error(res, 'Member not found.', 404);
    }

    if (member.status !== 'Active') {
      return error(res, 'Certificate can only be generated for active members.', 400);
    }

    const pdfBuffer = await generateCertificatePdf(member);

    // 4. PDF को डाउनलोड के रूप में भेजें
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate-${member.memberId}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Failed to generate certificate:', err);
    return error(res, 'Server error while generating certificate.');
  }
};

// @desc    Show a preview of a membership certificate
// @route   GET /api/certificates/preview/:id
// @access  Public
const previewCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findById(id);

    if (!member) {
      return error(res, 'Member not found.', 404);
    }

    if (member.status !== 'Active') {
      return error(res, 'Certificate is only available for active members.', 403);
    }

    const templatePath = path.join(__dirname, '..', 'templates', 'membershipCertificate.html');
    const htmlTemplate = await fs.readFile(templatePath, 'utf-8');

    const template = handlebars.compile(htmlTemplate);
    const issuedDate = new Date(member.membershipDate).toLocaleDateString('hi-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const context = {
      recipientName: member.fullName,
      memberId: member.memberId,
      certificateNumber: member.certificateNumber,
      issuedDate: issuedDate,
    };
    const finalHtml = template(context);

    // Add a download button to the preview
    const previewHtml = finalHtml.replace(
      '</body>',
      `<div style="position: fixed; top: 20px; right: 20px; z-index: 100;">
         <a href="/api/certificates/public-download/${member._id}" download="Certificate-${member.memberId}.pdf" style="background-color: #F97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-family: sans-serif; font-weight: bold;">Download PDF</a>
       </div>
      </body>`
    );

    res.setHeader('Content-Type', 'text/html');
    res.send(previewHtml);
  } catch (err) {
    console.error('Failed to create certificate preview:', err);
    return error(res, 'Server error while creating certificate preview.');
  }
};

// @desc    Publicly download a membership certificate
// @route   GET /api/certificates/public-download/:id
// @access  Public
const publicDownloadCertificate = async (req, res) => {
    try {
        const { id } = req.params;
        const member = await Member.findById(id);

        if (!member || member.status !== 'Active') {
            return error(res, 'Certificate not available.', 404);
        }

        const pdfBuffer = await generateCertificatePdf(member);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificate-${member.memberId}.pdf`);
        res.send(pdfBuffer);
    } catch (err) {
        console.error('Failed to download public certificate:', err);
        return error(res, 'Server error while downloading certificate.');
    }
};

module.exports = { downloadCertificate, previewCertificate, publicDownloadCertificate };