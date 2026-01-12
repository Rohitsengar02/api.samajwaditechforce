const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;
const PointActivity = require('../models/PointActivity');
const User = require('../models/User');

exports.renderPoster = async (req, res) => {
    let browser;
    try {
        const { designData } = req.body;
        const userId = req.user ? req.user._id : null;

        // --- RATE LIMIT CHECK ---
        if (userId) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const dailyCount = await PointActivity.countDocuments({
                user: userId,
                activityType: 'poster_create',
                timestamp: { $gte: startOfDay }
            });

            if (dailyCount >= 4) {
                return res.status(429).json({
                    message: 'Daily limit reached. You can only create 4 posters per day.'
                });
            }
        }

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

        // --- AWARD POINTS ---
        if (userId) {
            try {
                // Award 10 Points
                await User.findByIdAndUpdate(userId, { $inc: { points: 10 } });

                await PointActivity.create({
                    user: userId,
                    username: req.user.name || 'User',
                    activityType: 'poster_create',
                    points: 10,
                    description: 'Created a new poster',
                    timestamp: new Date()
                });
            } catch (pointError) {
                console.error('Error awarding points:', pointError);
                // Non-blocking
            }
        }

    } catch (error) {
        console.error('Render error:', error);
        res.status(500).json({ message: 'Master Render Failed', error: error.message });
    } finally {
        if (browser) await browser.close();
    }
};
