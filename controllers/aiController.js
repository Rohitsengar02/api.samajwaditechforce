const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.removeBackground = async (req, res) => {
    try {
        console.log('Cloudinary Config Check:', {
            cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
            api_key: !!process.env.CLOUDINARY_API_KEY,
            api_secret: !!process.env.CLOUDINARY_API_SECRET
        });

        const { image } = req.body; // Base64 string

        if (!image) {
            return res.status(400).json({ success: false, error: 'No image provided' });
        }

        // Upload to Cloudinary
        // We use background_removal parameter to trigger the add-on if available
        const result = await cloudinary.uploader.upload(image, {
            folder: 'ai-processed',
            background_removal: "cloudinary_ai_default"
        });

        // Construct URL with background removal effect
        // This ensures we get the transparent version
        const processedUrl = cloudinary.url(result.public_id, {
            effect: "background_removal",
            secure: true
        });

        res.json({
            success: true,
            image: processedUrl,
            original: result.secure_url
        });

    } catch (error) {
        console.error('Background removal error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error
        });
    }
};
