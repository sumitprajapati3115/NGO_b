const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: missing token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);

    try {
      const user = await User.findById(decoded.id).select('-password');
      req.user = user || { id: decoded.id, ...decoded };
    } catch (dbError) {
      req.user = { id: decoded.id, ...decoded };
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: token invalid or expired.' });
  }
};

module.exports = authenticate;
