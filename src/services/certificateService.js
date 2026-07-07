const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');

const templatePath = path.resolve(process.cwd(), 'src', 'templates', 'certificate.html');
const templateSource = fs.readFileSync(templatePath, 'utf8');
const template = Handlebars.compile(templateSource);

const generateCertificateHtml = (data) => template(data);

module.exports = {
  generateCertificateHtml,
};
