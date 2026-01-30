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

        if (!imageUrl && !imageBase64) {
            return res.status(400).json({
                success: false,
                message: 'Image data is required'
            });
        }

        // Prepare image buffer
        let imageBuffer;
        if (imageBase64) {
            imageBuffer = Buffer.from(imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64, 'base64');
        } else {
            const imageResponse = await fetch(imageUrl);
            const arrayBuffer = await imageResponse.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
        }

        // Optional: Resize if too large (to avoid 413 on downstream APIs)
        // For now, we rely on the APIs themselves or the frontend resizing.

        // 1. Try Buildora API (User Service) - PRIORITIZED
        try {
            console.log('🎨 Using Buildora API...');
            const buildoraFormData = new FormData();

            // Convert buffer to Blob for multipart upload
            const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
            buildoraFormData.append('image', blob, 'upload.jpg');

            const buildoraResponse = await fetch('https://api.buildora.cloud/api/remove-bg', {
                method: 'POST',
                headers: {
                    'x-api-key': process.env.BUILDORA_API_KEY || 'sk_dnbdt1qqsp3wfj9e20ro6',
                    'Origin': req.headers.origin || 'https://www.samajwaditechforce.com',
                    'Referer': req.headers.referer || 'https://www.samajwaditechforce.com'
                },
                body: buildoraFormData
            });

            if (buildoraResponse.ok) {
                const bData = await buildoraResponse.json();
                if (bData.success && bData.image) {
                    const finalImage = bData.image.startsWith('data:') ? bData.image : `data:image/png;base64,${bData.image}`;
                    return res.json({
                        success: true,
                        message: 'Background removed with Buildora',
                        imageUrl: finalImage
                    });
                }
            }
            console.warn('Buildora failed or returned error, falling back...');
        } catch (bError) {
            console.error('Buildora API Error:', bError);
        }

        // 2. Check for Remove.bg Key (Fallback 1)
        const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;
        if (REMOVE_BG_API_KEY) {
            try {
                console.log('🎨 Using Remove.bg API...');
                const formData = new FormData();
                formData.append('image_file_b64', imageBuffer.toString('base64'));

                const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
                    method: 'POST',
                    headers: { 'X-Api-Key': REMOVE_BG_API_KEY },
                    body: formData
                });

                if (removeBgResponse.ok) {
                    const buffer = await removeBgResponse.arrayBuffer();
                    const base64Image = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
                    return res.json({
                        success: true,
                        message: 'Background removed with Remove.bg',
                        imageUrl: base64Image
                    });
                }
                console.warn('Remove.bg failed, falling back...');
            } catch (err) {
                console.error('Remove.bg Error:', err);
            }
        }

        // 3. Fallback to Hugging Face
        const HF_API_TOKEN = process.env.HUGGING_FACE_API_KEY || process.env.EXPO_PUBLIC_REMOVE_BG_API_KEY;
        if (HF_API_TOKEN && HF_API_TOKEN.startsWith('hf_')) {
            try {
                console.log('🎨 Using Hugging Face API...');
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

                if (hfResponse.ok) {
                    const resultArgs = await hfResponse.arrayBuffer();
                    const resultBuffer = Buffer.from(resultArgs);
                    if (resultBuffer.length > 0) {
                        return res.json({
                            success: true,
                            message: 'Background removed with Hugging Face',
                            imageUrl: `data:image/png;base64,${resultBuffer.toString('base64')}`
                        });
                    }
                }
            } catch (hfErr) {
                console.error('Hugging Face Error:', hfErr);
            }
        }

        throw new Error('All background removal services failed or are unconfigured');

    } catch (error) {
        console.error('❌ Background removal failed:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Background removal failed'
        });
    }
});

module.exports = router;
