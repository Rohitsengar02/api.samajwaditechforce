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

        // Use req.user.id if available (via auth middleware), otherwise expect userId in body
        const userId = req.user ? req.user.id : req.body.userId;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authorized' });
        }

        // Check if the news has already been liked
        if (news.likes.filter(like => like.toString() === userId).length > 0) {
            // Get remove index
            const removeIndex = news.likes.map(like => like.toString()).indexOf(userId);
            news.likes.splice(removeIndex, 1);
        } else {
            news.likes.unshift(userId);
        }

        await news.save();

        res.status(200).json({
            success: true,
            data: news.likes
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

        const { text, userId, name } = req.body;

        // Use req.user if available, otherwise expect body params
        const user = req.user ? req.user.id : userId;
        const userName = req.user ? req.user.name : name;

        if (!user || !text || !userName) {
            return res.status(400).json({ success: false, error: 'Please provide text and user info' });
        }

        const newComment = {
            user,
            name: userName,
            text,
            date: Date.now()
        };

        news.comments.unshift(newComment);

        await news.save();

        res.status(201).json({
            success: true,
            data: news.comments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
