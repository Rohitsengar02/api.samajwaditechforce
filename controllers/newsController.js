const News = require('../models/News');

// @desc    Get all news
// @route   GET /api/news
// @access  Public
exports.getNews = async (req, res, next) => {
    try {
        const news = await News.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: news.length,
            data: news
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single news
// @route   GET /api/news/:id
// @access  Public
exports.getSingleNews = async (req, res, next) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, error: 'News not found' });
        }

        // Increment views
        news.views = (news.views || 0) + 1;
        await news.save();

        res.status(200).json({
            success: true,
            data: news
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create new news
// @route   POST /api/news
// @access  Private (Admin)
exports.createNews = async (req, res, next) => {
    try {
        console.log('=== CREATE NEWS REQUEST ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('Request headers:', req.headers);

        const news = await News.create(req.body);

        console.log('News created successfully:', news._id);

        res.status(201).json({
            success: true,
            data: news
        });
    } catch (err) {
        console.error('=== CREATE NEWS ERROR ===');
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        console.error('Full error:', err);

        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error: ' + err.message });
    }
};

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Private (Admin)
exports.updateNews = async (req, res, next) => {
    try {
        let news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, error: 'News not found' });
        }

        news = await News.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: news
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private (Admin)
exports.deleteNews = async (req, res, next) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, error: 'News not found' });
        }

        await news.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Like news
// @route   PUT /api/news/:id/like
// @access  Private
exports.likeNews = async (req, res, next) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, error: 'News not found' });
        }

        const userId = req.user ? req.user.id : req.body.userId;
        const username = req.body.username;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authorized' });
        }

        // Initialize arrays if they don't exist
        if (!news.likedBy) news.likedBy = [];
        if (!news.likes) news.likes = [];

        // Check if the news has already been liked
        const alreadyLiked = news.likes.some(like => like.toString() === userId);

        if (alreadyLiked) {
            // Remove like
            const removeIndex = news.likes.map(like => like.toString()).indexOf(userId);
            news.likes.splice(removeIndex, 1);

            await news.save();

            return res.status(200).json({
                success: true,
                data: news.likes,
                removed: true
            });
        }

        // Add like
        news.likes.unshift(userId);

        // Check if user has liked before for points
        const alreadyLikedForPoints = news.likedBy.some(l => l.user && l.user.toString() === userId);
        let points = 0;
        let firstLike = false;

        if (!alreadyLikedForPoints && username) {
            // Award 5 points for first like
            points = 5;
            firstLike = true;

            news.likedBy.push({
                user: userId,
                username: username,
                timestamp: new Date()
            });

            // Award points to user
            const User = require('../models/User');
            await User.findByIdAndUpdate(userId, {
                $inc: { points: points }
            });

            // Log in point activity
            const PointActivity = require('../models/PointActivity');
            await PointActivity.create({
                user: userId,
                username: username,
                activityType: 'news_like',
                points: points,
                description: `Liked news: ${news.title.substring(0, 50)}...`,
                relatedId: news._id
            });
        }

        await news.save();

        res.status(200).json({
            success: true,
            data: news.likes,
            points,
            firstLike
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Comment on news
// @route   POST /api/news/:id/comment
// @access  Private
exports.commentNews = async (req, res, next) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, error: 'News not found' });
        }

        const { text, userId, name, username } = req.body;

        const user = req.user ? req.user.id : userId;
        const userName = req.user ? req.user.name : name;

        if (!user || !text || !userName) {
            return res.status(400).json({ success: false, error: 'Please provide text and user info' });
        }

        // Initialize arrays if they don't exist
        if (!news.commentedBy) news.commentedBy = [];
        if (!news.comments) news.comments = [];

        const newComment = {
            user,
            name: userName,
            text,
            date: Date.now()
        };

        news.comments.unshift(newComment);

        // Check if user has commented before for points
        const alreadyCommented = news.commentedBy.some(c => c.user && c.user.toString() === user);
        let points = 0;
        let firstComment = false;

        if (!alreadyCommented && username) {
            // Award 10 points for first comment
            points = 10;
            firstComment = true;

            news.commentedBy.push({
                user: user,
                username: username,
                timestamp: new Date()
            });

            // Award points to user
            const User = require('../models/User');
            await User.findByIdAndUpdate(user, {
                $inc: { points: points }
            });

            // Log in point activity
            const PointActivity = require('../models/PointActivity');
            await PointActivity.create({
                user: user,
                username: username,
                activityType: 'news_comment',
                points: points,
                description: `Commented on news: ${news.title.substring(0, 50)}...`,
                relatedId: news._id
            });
        }

        await news.save();

        res.status(201).json({
            success: true,
            data: news.comments,
            points,
            firstComment
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Share news
// @route   POST /api/news/:id/share
// @access  Private
exports.shareNews = async (req, res, next) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, error: 'News not found' });
        }

        const { userId, username } = req.body;

        if (!userId || !username) {
            return res.status(400).json({ success: false, error: 'User info required' });
        }

        // Initialize array if doesn't exist
        if (!news.sharedBy) news.sharedBy = [];

        // Check if user has shared before for points
        const alreadyShared = news.sharedBy.some(s => s.user && s.user.toString() === userId);
        let points = 0;
        let firstShare = false;

        if (!alreadyShared) {
            // Award 10 points for first share
            points = 10;
            firstShare = true;

            news.sharedBy.push({
                user: userId,
                username: username,
                timestamp: new Date()
            });

            // Award points to user
            const User = require('../models/User');
            await User.findByIdAndUpdate(userId, {
                $inc: { points: points }
            });

            // Log in point activity
            const PointActivity = require('../models/PointActivity');
            await PointActivity.create({
                user: userId,
                username: username,
                activityType: 'news_share',
                points: points,
                description: `Shared news: ${news.title.substring(0, 50)}...`,
                relatedId: news._id
            });

            await news.save();
        }

        res.status(200).json({
            success: true,
            points,
            firstShare
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
