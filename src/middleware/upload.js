const multer = require('../config/multer');

const uploadSingle = (fieldName = 'file') => multer.single(fieldName);
const uploadMultiple = (fieldName = 'files') => multer.array(fieldName, 10);

const handleUploadError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message || 'File upload failed.' });
  }
  next();
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
};
