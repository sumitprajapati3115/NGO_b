const pdf = require('html-pdf');
const path = require('path');

const generateCertificatePdf = (html, fileName) => {
  const filePath = path.resolve(process.cwd(), 'src', 'uploads', 'certificates', fileName);
  return new Promise((resolve, reject) => {
    pdf.create(html).toFile(filePath, (err, res) => {
      if (err) return reject(err);
      resolve(res.filename);
    });
  });
};

module.exports = generateCertificatePdf;
