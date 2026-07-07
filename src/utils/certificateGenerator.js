const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs/promises');
const path = require('path');

/**
 * किसी सदस्य के लिए एक PDF प्रमाण पत्र बनाता है।
 * @param {object} member - डेटाबेस से सदस्य ऑब्जेक्ट।
 * @returns {Promise<Buffer>} - एक प्रॉमिस जो PDF बफर के साथ रिजॉल्व होता है।
 */
const generateCertificatePdf = async (member) => {
  // 1. HTML टेम्पलेट लोड करें
  const templatePath = path.join(__dirname, '..', 'templates', 'membershipCertificate.html');
  const htmlTemplate = await fs.readFile(templatePath, 'utf-8');

  // 2. डेटा के साथ टेम्पलेट को कंपाइल करें
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

  // 3. Puppeteer का उपयोग करके HTML से PDF बनाएं
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    width: '860px',
    height: '1215px',
    printBackground: true,
  });
  await browser.close();

  return pdfBuffer;
};

module.exports = { generateCertificatePdf };