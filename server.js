// Polyfill for DOMMatrix to support pdf-parse in Node environment
if (!global.DOMMatrix) {
    global.DOMMatrix = class DOMMatrix {
        constructor() {
            this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
        }
        setMatrixValue(str) { return this; }
        translate(x, y) { return this; }
        scale(x, y) { return this; }
        rotate(angle) { return this; }
        multiply(m) { return this; }
    };
}

// trigger deploy
const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // Load env vars immediately
const cors = require('cors');
const connectDB = require('./config/db');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

// Route files
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const districtRoutes = require('./routes/districtRoutes');
const vidhansabhaRoutes = require('./routes/vidhansabhaRoutes');
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
const eventRoutes = require('./routes/eventRoutes');

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
    console.log('--- Server Starting (Schema Update Applied) ---');
    console.log('Connecting to MongoDB...', socket.id);

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

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:8081',
        'http://localhost:3000',
        'http://localhost:19006',
        'https://admin.samajwaditechforce.com',
        'https://samajwaditechforce.com',
        'https://www.samajwaditechforce.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
};

// If in development, allow all origins
if (process.env.NODE_ENV === 'development') {
    corsOptions.origin = true;
}

app.use(cors(corsOptions));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(morgan('dev'));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/vidhansabha', vidhansabhaRoutes);
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
app.use('/api/points', require('./routes/pointRoutes'));
app.use('/api/home-content', require('./routes/homeContentRoutes'));
app.use('/api/footer', require('./routes/footerRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/events', eventRoutes);
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/contact-settings', require('./routes/contactSettingsRoutes'));
app.use('/api/background-removal', require('./routes/backgroundRemoval'));
app.use('/api/render', require('./routes/renderRoutes'));
app.use('/share', require('./routes/shareRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO ready for connections`);
});
