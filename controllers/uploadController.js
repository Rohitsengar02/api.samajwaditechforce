const cloudinary = require('cloudinary').v2;
const { uploadImageOptimized, uploadVideoOptimized } = require('../utils/cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Upload image to cloudinary (OPTIMIZED)
// @route   POST /api/upload/image
// @access  Private/Admin
const uploadImage = async (req, res) => {
    try {
        const { image, folder = 'events' } = req.body;

        if (!image) {
            return res.status(400).json({
                success: false,
                message: 'No image provided'
            });
        }

        // Upload with optimization - reduces size by 60-80%
        const result = await uploadImageOptimized(image, `samajwadi-party/${folder}`);

        res.json({
            success: true,
            message: 'Image uploaded successfully (optimized)',
            data: {
                url: result.url,
                publicId: result.publicId,
                bytes: result.bytes
            }
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: error.message
        });
    }
};

// @desc    Upload video to cloudinary (OPTIMIZED)
// @route   POST /api/upload/video
// @access  Private/Admin
const uploadVideo = async (req, res) => {
    try {
        const { video, folder = 'reels' } = req.body;

        if (!video) {
            return res.status(400).json({
                success: false,
                message: 'No video provided'
            });
        }

        // Upload with optimization - 20MB video becomes ~4-8MB
        const result = await uploadVideoOptimized(video, `samajwadi-party/${folder}`);

        res.json({
            success: true,
            message: 'Video uploaded successfully (optimized with H.265/VP9)',
            data: {
                url: result.url,
                optimizedUrl: result.optimizedUrl,
                publicId: result.publicId,
                duration: result.duration,
                bytes: result.bytes
            }
        });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading video',
            error: error.message
        });
    }
};

// @desc    Upload poster for sharing (OPTIMIZED)
// @route   POST /api/upload/poster-share
// @access  Public
const uploadPosterForShare = async (req, res) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({
                success: false,
                message: 'No image provided'
            });
        }

        // Upload with optimization
        const result = await uploadImageOptimized(image, 'samajwadi-party/shared-posters');

        res.json({
            success: true,
            message: 'Poster uploaded for sharing (optimized)',
            data: {
                url: result.url,
                publicId: result.publicId,
                bytes: result.bytes
            }
        });
    } catch (error) {
        console.error('Error uploading poster for share:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading poster',
            error: error.message
        });
    }
};

module.exports = {
    uploadImage,
    uploadVideo,
    uploadPosterForShare
};
