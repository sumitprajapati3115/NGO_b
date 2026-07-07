const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');

const donationsRouter = require('./routes/donationRoutes');
const memberRouter = require('./routes/memberRoutes');
const certificateRouter = require('./routes/certificateRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const galleryRouter = require('./routes/galleryRoutes');
const eventRouter = require('./routes/eventRoutes');
const volunteerRouter = require('./routes/volunteerRoutes');
const contactRouter = require('./routes/contactRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');
const adminRouter = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files if needed
app.use('/uploads', express.static(path.resolve(process.cwd(), config.fileUploadPath)));

app.use('/api/donations', donationsRouter);
app.use('/api/members', memberRouter);
app.use('/api/certificates', certificateRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/events', eventRouter);
app.use('/api/volunteers', volunteerRouter);
app.use('/api/contact', contactRouter);
app.use('/api/team', require('./routes/teamRoutes'));
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin', adminRouter);

const errorHandler = require('./middleware/errorHandler');

app.get('/', (req, res) => {
  res.json({ message: 'NGO backend is running.' });
});

app.use(errorHandler);

module.exports = app;
