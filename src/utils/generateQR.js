const QRCode = require('qrcode');

const generateQR = async (text) => {
  return QRCode.toDataURL(text, {
    type: 'image/png',
    width: 400,
    margin: 2,
  });
};

module.exports = generateQR;
