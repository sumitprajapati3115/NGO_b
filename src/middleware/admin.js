const authenticate = require('./auth');

const authorizeAdmin = (req, res, next) => {
  authenticate(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: admin access required.' });
    }
    next();
  });
};

module.exports = authorizeAdmin;
