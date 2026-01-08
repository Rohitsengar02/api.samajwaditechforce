const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Upload image to cloudinary
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

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(image, {
            folder: `samajwadi-party/${folder}`,
            resource_type: 'auto'
        });

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: result.secure_url,
                publicId: result.public_id
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

// @desc    Upload poster for sharing (public)
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

        // Upload to Cloudinary with a specific folder for shared posters
        const result = await cloudinary.uploader.upload(image, {
            folder: 'samajwadi-party/shared-posters',
            resource_type: 'image',
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        });

        res.json({
            success: true,
            message: 'Poster uploaded for sharing',
            data: {
                url: result.secure_url,
                publicId: result.public_id
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
    uploadPosterForShare
};
