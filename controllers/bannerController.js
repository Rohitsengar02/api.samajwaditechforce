const Banner = require('../models/Banner');

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
exports.getBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: banners.length,
            banners
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private (Admin)
exports.createBanner = async (req, res) => {
    try {
        const { title, imageUrl } = req.body;

        const banner = await Banner.create({
            title,
            imageUrl
        });

        res.status(201).json({
            success: true,
            banner
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
