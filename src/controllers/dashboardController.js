const Donation = require('../models/Donation');
const Member = require('../models/Member');
const Certificate = require('../models/Certificate');
const Volunteer = require('../models/Volunteer');
const Contact = require('../models/Contact'); // Make sure this is imported

const getDashboardStats = async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments();
    const totalDonations = await Donation.countDocuments();
    const totalCertificates = await Certificate.countDocuments();
    const totalDonationAmount = await Donation.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: { $toDouble: '$donationAmount' } } } },
    ]);

    const recentDonations = await Donation.find().sort({ createdAt: -1 }).limit(5);
    const recentMembers = await Member.find().sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      totalMembers,
      totalDonations,
      totalCertificates,
      totalDonationAmount: totalDonationAmount[0]?.total || 0,
      recentDonations,
      recentMembers,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Unable to fetch dashboard stats.' });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments();
    const pendingApplications = await Member.countDocuments({ status: 'Pending' });
    const totalNewContacts = await Contact.countDocuments({ status: 'new' }); // This line is correct

    // Calculate total donation amount for the current month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyDonationData = await Donation.aggregate([
      { $match: { status: 'Completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: { $toDouble: '$donationAmount' } } } },
    ]);

    const activeVolunteers = await Volunteer.countDocuments({ status: 'Active' });

    const stats = [
      { name: 'Total Members', value: totalMembers, icon: 'FaUsers' },
      { name: 'Pending Applications', value: pendingApplications, icon: 'FaUserClock' },
      { name: 'New Messages', value: totalNewContacts, icon: 'FaEnvelope' }, // This line is correct
      { name: 'Donations (Month)', value: monthlyDonationData[0]?.total || 0, icon: 'FaRupeeSign', isCurrency: true },
      { name: 'Active Volunteers', value: activeVolunteers, icon: 'FaHeart' },
    ];

    const recentMembers = await Member.find().sort({ createdAt: -1 }).limit(5).select('fullName createdAt');
    const recentDonations = await Donation.find({ status: 'Completed' }).sort({ createdAt: -1 }).limit(5).select('fullName donationAmount createdAt');

    // --- Chart Data Aggregation ---
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const memberGrowthData = await Member.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          name: {
            $concat: [
              { $arrayElemAt: [['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], '$_id.month'] },
              ' ',
              { $toString: '$_id.year' }
            ]
          },
          "New Members": '$count',
        },
      },
    ]);

    const donationTrendData = await Donation.aggregate([
      { $match: { status: 'Completed', createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: { $toDouble: '$donationAmount' } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          name: {
            $concat: [
              { $arrayElemAt: [['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], '$_id.month'] },
              ' ',
              { $toString: '$_id.year' }
            ]
          },
          "Donations": '$total',
        },
      },
    ]);
    // --- End Chart Data ---

    res.status(200).json({
      stats,
      recentMembers,
      recentDonations,
      memberGrowthData,
      donationTrendData,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Unable to fetch admin stats.' });
  }
};

module.exports = {
  getDashboardStats,
  getAdminStats,
};
