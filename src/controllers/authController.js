// const Admin = require('../models/Admin');
// const jwt = require('jsonwebtoken');
// const { success, error } = require('../utils/response');

// // JWT जेनरेट करने के लिए फंक्शन
// const generateToken = (id) => {
//   // सुनिश्चित करें कि आपकी .env फ़ाइल में JWT_SECRET सेट है
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: '30d', // टोकन 30 दिनों में समाप्त हो जाएगा
//   });
// };

// // @desc    Auth user & get token (Login)
// // @route   POST /api/auth/login
// // @access  Public
// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return error(res, 'Please provide an email and password.', 400);
//   }

//   try {
//     // उपयोगकर्ता को ईमेल से ढूंढें
//     const adminUser = await Admin.findOne({ email: email.toLowerCase() });

//     // उपयोगकर्ता की जांच करें और पासवर्ड की तुलना करें
//     if (adminUser && (await adminUser.comparePassword(password))) {
//       return success(res, {
//         _id: adminUser._id,
//         email: adminUser.email,
//         role: adminUser.role,
//         token: generateToken(adminUser._id),
//       });
//     } else {
//       return error(res, 'Invalid email or password', 401); // 401 Unauthorized
//     }
//   } catch (err) {
//     console.error(err);
//     return error(res, 'Server error during login.');
//   }
// };

// module.exports = { loginUser };
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { success, error } = require('../utils/response');

// JWT जेनरेट करने के लिए फंक्शन
const generateToken = (id) => {
  // सुनिश्चित करें कि आपकी .env फ़ाइल में JWT_SECRET सेट है
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // टोकन 30 दिनों में समाप्त हो जाएगा
  });
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // उपयोगकर्ता को ईमेल से ढूंढें
    const user = await User.findOne({ email });

    // उपयोगकर्ता की जांच करें और पासवर्ड की तुलना करें
    if (user && (await user.comparePassword(password))) {
      return success(res, {
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      return error(res, 'Invalid email or password', 401); // 401 Unauthorized
    }
  } catch (err) {
    console.error(err);
    return error(res, 'Server error during login.');
  }
};

module.exports = { loginUser };