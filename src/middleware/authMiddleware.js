const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require('../utils/response');

// उपयोगकर्ता को प्रमाणित करने के लिए मिडलवेयर
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // हेडर से टोकन प्राप्त करें (Bearer को हटाकर)
      token = req.headers.authorization.split(' ')[1];

      // टोकन को सत्यापित करें
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // टोकन से उपयोगकर्ता को प्राप्त करें और उसे req ऑब्जेक्ट में जोड़ें
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return error(res, 'Not authorized, user not found', 401);
      }

      next(); // अगले मिडलवेयर पर जाएं
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return error(res, 'Not authorized, token failed', 401);
    }
  }

  if (!token) {
    return error(res, 'Not authorized, no token', 401);
  }
};

// यह जांचने के लिए मिडलवेयर कि उपयोगकर्ता एडमिन है या नहीं
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return error(res, 'Not authorized as an admin', 403); // 403 Forbidden
  }
};

module.exports = { protect, admin };