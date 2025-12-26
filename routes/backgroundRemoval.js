const express = require('express');
const router = express.Router();
// const fetch = require('node-fetch'); // Built-in fetch used in Node 18+

/**
 * POST /api/background-removal/remove
 * Proxy endpoint for Hugging Face background removal
 * Solves CORS issues when calling from web browsers
 */
router.post('/remove', async (req, res) => {
    try {
        const { imageUrl, imageBase64 } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Image URL is required'
            });
        }

        // Check for Remove.bg Key first (Higher reliability)
        const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;

        if (REMOVE_BG_API_KEY) {
            console.log('🎨 Using Remove.bg API...');
            const formData = new FormData();
            if (imageBase64) {
                formData.append('image_file_b64', imageBase64);
            } else {
                formData.append('image_url', imageUrl);
            }

            const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': REMOVE_BG_API_KEY
                },
                body: formData
            });

            if (!removeBgResponse.ok) {
                const err = await removeBgResponse.text();
                throw new Error(`Remove.bg Error: ${removeBgResponse.status} - ${err}`);
            }

            const buffer = await removeBgResponse.arrayBuffer();
            const base64Image = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;

            return res.json({
                success: true,
                message: 'Background removed with Remove.bg',
                imageUrl: base64Image
            });
        }

        // Fallback to Hugging Face
        const HF_API_TOKEN = process.env.HUGGING_FACE_API_KEY || process.env.EXPO_PUBLIC_REMOVE_BG_API_KEY;
        console.log('🔑 HF Key Check:', HF_API_TOKEN ? 'Loaded' : 'Missing');

        if (!HF_API_TOKEN || !HF_API_TOKEN.startsWith('hf_')) {
            // ... existing HF error handling ...
            if (!REMOVE_BG_API_KEY) {
                return res.status(500).json({
                    success: false,
                    message: 'No Background Removal API Key configured (Add REMOVE_BG_API_KEY)'
                });
            }
        }

        console.log('🎨 Using Hugging Face API (Fallback)...');

        // Prepare image buffer (from Base64 or URL)
        let imageBuffer;
        if (imageBase64) {
            imageBuffer = Buffer.from(imageBase64, 'base64');
        } else {
            // Fetch the image from URL
            const imageResponse = await fetch(imageUrl);
            const arrayBuffer = await imageResponse.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
        }

        // Call Hugging Face API
        const hfResponse = await fetch(
            'https://router.huggingface.co/hf-inference/models/briaai/RMBG-1.4',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_API_TOKEN}`,
                    'Content-Type': 'application/octet-stream'
                },
                body: imageBuffer,
            }
        );

        if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            console.error('Hugging Face API error:', hfResponse.status, errorText);
            throw new Error(`Hugging Face Error: ${hfResponse.status} (Try adding REMOVE_BG_API_KEY)`);
        }

        // Get the result as buffer
        const resultArgs = await hfResponse.arrayBuffer();
        const resultBuffer = Buffer.from(resultArgs);

        if (resultBuffer.length === 0) {
            throw new Error('Received empty image from API');
        }

        // Convert to base64 to send to frontend
        const base64Image = `data:image/png;base64,${resultBuffer.toString('base64')}`;

        console.log('✅ Background removed successfully');
        res.json({
            success: true,
            message: 'Background removed successfully',
            imageUrl: base64Image
        });

    } catch (error) {
        console.error('❌ Background removal failed:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Background removal failed'
        });
    }
});

module.exports = router;
