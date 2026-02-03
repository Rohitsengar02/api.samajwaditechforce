const Poster = require('../models/Poster');
const cloudinary = require('cloudinary').v2;
const PointActivity = require('../models/PointActivity');
const User = require('../models/User');

// Configure Cloudinary (if not already configured in your main app)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload a new poster
exports.uploadPoster = async (req, res) => {
    try {
        const { title, imageBase64 } = req.body;
        const userId = req.user.id;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        if (!imageBase64) {
            return res.status(400).json({ message: 'Poster image is required' });
        }

        // Upload base64 image to Cloudinary with OPTIMIZATION
        const result = await cloudinary.uploader.upload(imageBase64, {
            folder: 'sp-posters',
            resource_type: 'image',
            // Optimize on upload - reduces storage by 60-80%
            transformation: [
                { quality: 'auto:best' },
                { fetch_format: 'auto' }
            ]
        });

        // Create poster in database
        const poster = new Poster({
            title,
            imageUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
            uploadedBy: userId
        });

        await poster.save();

        res.status(201).json({
            message: 'Poster uploaded successfully',
            poster
        });
    } catch (error) {
        console.error('Upload poster error:', error);
        res.status(500).json({ message: 'Error uploading poster', error: error.message });
    }
};

// Get all posters (with pagination)
exports.getAllPosters = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posters = await Poster.find({ isActive: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('uploadedBy', 'name email');

        const total = await Poster.countDocuments({ isActive: true });

        res.status(200).json({
            posters,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: posters.length,
                totalPosters: total
            }
        });
    } catch (error) {
        console.error('Get posters error:', error);
        res.status(500).json({ message: 'Error fetching posters', error: error.message });
    }
};

// Get single poster by ID
exports.getPosterById = async (req, res) => {
    try {
        const poster = await Poster.findById(req.params.id)
            .populate('uploadedBy', 'name email');

        if (!poster) {
            return res.status(404).json({ message: 'Poster not found' });
        }

        res.status(200).json({ poster });
    } catch (error) {
        console.error('Get poster error:', error);
        res.status(500).json({ message: 'Error fetching poster', error: error.message });
    }
};

// Track poster download
exports.trackDownload = async (req, res) => {
    try {
        const posterId = req.params.id;
        const userId = req.user.id;

        const poster = await Poster.findById(posterId);

        if (!poster) {
            return res.status(404).json({ message: 'Poster not found' });
        }

        // Check if user already downloaded
        const alreadyDownloaded = poster.usersWhoDownloaded.some(
            user => user.userId.toString() === userId
        );

        if (!alreadyDownloaded) {
            poster.usersWhoDownloaded.push({
                userId: userId,
                downloadedAt: new Date()
            });

            // Award Points for Download
            try {
                await User.findByIdAndUpdate(userId, { $inc: { points: 10 } });
                await PointActivity.create({
                    user: userId,
                    username: req.user.name || 'User',
                    activityType: 'poster_download',
                    points: 10,
                    description: `Downloaded poster: ${poster.title}`,
                    timestamp: new Date(),
                    relatedId: poster._id
                });
            } catch (err) {
                console.error('Error awarding download points:', err);
            }
        }

        poster.downloadCount += 1;
        await poster.save();

        res.status(200).json({
            message: 'Download tracked successfully',
            downloadCount: poster.downloadCount,
            pointsAwarded: !alreadyDownloaded,
            points: !alreadyDownloaded ? 10 : 0
        });
    } catch (error) {
        console.error('Track download error:', error);
        res.status(500).json({ message: 'Error tracking download', error: error.message });
    }
};

// Update poster
exports.updatePoster = async (req, res) => {
    try {
        const { title, isActive, imageBase64 } = req.body;
        const posterId = req.params.id;

        const poster = await Poster.findById(posterId);

        if (!poster) {
            return res.status(404).json({ message: 'Poster not found' });
        }

        if (title) poster.title = title;
        if (typeof isActive !== 'undefined') poster.isActive = isActive;

        // If new image is provided, upload to Cloudinary
        if (imageBase64) {
            // Delete old image from Cloudinary
            if (poster.cloudinaryPublicId) {
                await cloudinary.uploader.destroy(poster.cloudinaryPublicId);
            }

            // Upload new image with OPTIMIZATION
            const result = await cloudinary.uploader.upload(imageBase64, {
                folder: 'sp-posters',
                resource_type: 'image',
                transformation: [
                    { quality: 'auto:best' },
                    { fetch_format: 'auto' }
                ]
            });

            poster.imageUrl = result.secure_url;
            poster.cloudinaryPublicId = result.public_id;
        }

        await poster.save();

        res.status(200).json({
            message: 'Poster updated successfully',
            poster
        });
    } catch (error) {
        console.error('Update poster error:', error);
        res.status(500).json({ message: 'Error updating poster', error: error.message });
    }
};

// Delete poster
exports.deletePoster = async (req, res) => {
    try {
        const posterId = req.params.id;

        const poster = await Poster.findById(posterId);

        if (!poster) {
            return res.status(404).json({ message: 'Poster not found' });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(poster.cloudinaryPublicId);

        // Delete from database
        await Poster.findByIdAndDelete(posterId);

        res.status(200).json({ message: 'Poster deleted successfully' });
    } catch (error) {
        console.error('Delete poster error:', error);
        res.status(500).json({ message: 'Error deleting poster', error: error.message });
    }
};

// Get poster statistics
exports.getPosterStats = async (req, res) => {
    try {
        const totalPosters = await Poster.countDocuments({ isActive: true });
        const totalDownloads = await Poster.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, total: { $sum: '$downloadCount' } } }
        ]);

        const mostDownloaded = await Poster.find({ isActive: true })
            .sort({ downloadCount: -1 })
            .limit(5)
            .populate('uploadedBy', 'name');

        res.status(200).json({
            totalPosters,
            totalDownloads: totalDownloads[0]?.total || 0,
            mostDownloaded
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Error fetching statistics', error: error.message });
    }
};

// Get list of users who downloaded a specific poster
exports.getPosterDownloads = async (req, res) => {
    try {
        const poster = await Poster.findById(req.params.id)
            .populate('usersWhoDownloaded.userId', 'name phone profileImage');

        if (!poster) {
            return res.status(404).json({ message: 'Poster not found' });
        }

        res.status(200).json({
            posterTitle: poster.title,
            downloadCount: poster.downloadCount,
            downloads: poster.usersWhoDownloaded
        });
    } catch (error) {
        console.error('Get poster downloads error:', error);
        res.status(500).json({ message: 'Error fetching downloads', error: error.message });
    }
};
