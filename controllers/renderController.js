const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;

exports.renderPoster = async (req, res) => {
    let browser;
    try {
        const { designData } = req.body;

        if (!designData) {
            return res.status(400).json({ message: 'Design data is required' });
        }

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Use the Expo local URL (or production URL if deployed)
        const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:8081';
        const exportUrl = `${BASE_URL}/export-master?data=${encodeURIComponent(JSON.stringify(designData))}`;

        // Set a massive viewport for High-DPI capture
        await page.setViewport({
            width: 2000,
            height: 2500,
            deviceScaleFactor: 3 // This makes it 6000x7500 resolution!
        });

        await page.goto(exportUrl, { waitUntil: 'networkidle0', timeout: 60000 });

        // Wait for all images and fonts to stabilize
        await new Promise(r => setTimeout(r, 2000));

        const screenshot = await page.screenshot({
            type: 'png',
            omitBackground: true,
            fullPage: false
        });

        // OPTIONAL: Upload to Cloudinary for sharing link
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'pro-renders', resource_type: 'image' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(screenshot);
        });

        res.status(200).json({
            success: true,
            imageUrl: uploadResult.secure_url,
            message: 'Master Render Generated Successfully'
        });

    } catch (error) {
        console.error('Render error:', error);
        res.status(500).json({ message: 'Master Render Failed', error: error.message });
    } finally {
        if (browser) await browser.close();
    }
};
