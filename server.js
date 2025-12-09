const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

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
const pageRoutes = require('./routes/pageRoutes');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: true, // Allow all origins in development
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Make io accessible to routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    // Join user to their personal room
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their room`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// CORS configuration - Allow all origins for development
const corsOptions = {
    origin: true, // Allow all origins in development
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
app.use('/api/pages', pageRoutes);
app.use('/api/reels', require('./routes/reelRoutes'));
app.use('/api/home-content', require('./routes/homeContentRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO ready for connections`);
});
