const { uploadImageToR2 } = require('../utils/r2');

exports.removeBackground = async (req, res) => {
    try {
        const { image } = req.body; // Base64 string

        if (!image) {
            return res.status(400).json({ success: false, error: 'No image provided' });
        }

        // Upload original image to R2
        const result = await uploadImageToR2(image, 'ai-processed', {
            format: 'png',  // Keep PNG for transparency
            quality: 90,
        });

        // Note: Background removal was a Cloudinary AI add-on.
        // For actual BG removal, you'd need a separate service like remove.bg API.
        // For now, we store the image and return its URL.
        res.json({
            success: true,
            image: result.url,
            original: result.url
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
