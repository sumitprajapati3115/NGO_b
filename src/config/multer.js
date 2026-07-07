const multer = require('multer');
const path = require('path');
const { fileUploadPath } = require('./env');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(process.cwd(), fileUploadPath));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  },
});

const allowedTypes = /jpeg|jpg|png|gif|pdf/;

const fileFilter = (req, file, cb) => {
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    && allowedTypes.test(file.mimetype);

  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Only image and PDF uploads are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = upload;
