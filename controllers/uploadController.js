const { uploadImageToR2, uploadVideoToR2 } = require('../utils/r2');

// @desc    Upload image to R2 (OPTIMIZED with Sharp)
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

        // Upload with Sharp compression - reduces size by 60-80%
        const result = await uploadImageToR2(image, folder);

        res.json({
            success: true,
            message: 'Image uploaded successfully (optimized)',
            data: {
                url: result.url,
                publicId: result.key,
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

// @desc    Upload video to R2
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

        const result = await uploadVideoToR2(video, folder);

        res.json({
            success: true,
            message: 'Video uploaded successfully',
            data: {
                url: result.url,
                optimizedUrl: result.optimizedUrl,
                publicId: result.key,
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
        const result = await uploadImageToR2(image, 'shared-posters');

        res.json({
            success: true,
            message: 'Poster uploaded for sharing (optimized)',
            data: {
                url: result.url,
                publicId: result.key,
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
