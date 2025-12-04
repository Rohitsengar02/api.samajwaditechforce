const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const morgan = require('morgan');

// Route files
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const districtRoutes = require('./routes/districtRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const taskRoutes = require('./routes/taskRoutes');
const resourceRoutes = require('./routes/resources');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const newsRoutes = require('./routes/news');
const adminRoutes = require('./routes/adminRoutes');
const posterRoutes = require('./routes/posterRoutes');
const bannerRoutes = require('./routes/bannerRoutes');

dotenv.config();

connectDB();

const app = express();

// CORS configuration - Allow your deployment domains
const corsOptions = {
    origin: [
        'http://localhost:8081',
        'http://localhost:19006',
        'https://admin.samajwaditechforce.com',
        'https://admin-samajwditechforce.vercel.app',
        'https://samajwaditechforce.com',
        'https://www.samajwaditechforce.com'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posters', posterRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/ai-gemini', require('./routes/bgremove'));
app.use('/api/onboarding', require('./routes/onboardingRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
