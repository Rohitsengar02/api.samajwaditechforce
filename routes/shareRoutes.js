const express = require('express');
const router = express.Router();
const News = require('../models/News');

// @desc    Get shareable news page with Open Graph meta tags
// @route   GET /share/news/:id
// @access  Public
router.get('/news/:id', async (req, res) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).send('<h1>News not found</h1>');
        }

        const appUrl = process.env.APP_URL || 'https://samajwaditechforce.com';
        const redirectUrl = `${appUrl}/news/${news._id}`;

        const currentHost = req.get('host');
        // Force https to satisfy Facebook's strict security requirements for og:url
        const shareUrl = `https://${currentHost}${req.originalUrl}`;

        let imageUrl = news.coverImage || `${appUrl}/assets/images/logo.png`;
        if (imageUrl.startsWith('/')) {
            imageUrl = `https://${currentHost}${imageUrl}`;
        }

        // Optimize Cloudinary images for Facebook (Standard: 1200x630)
        if (imageUrl.includes('cloudinary.com') && imageUrl.includes('/upload/')) {
            imageUrl = imageUrl.replace('/upload/', '/upload/c_fill,w_1200,h_630,q_auto,f_jpg/');
        } else if (!imageUrl.startsWith('http')) {
            imageUrl = `https://${currentHost}/${imageUrl}`;
        }

        const title = news.title || 'Samajwadi Tech Force News';
        const description = news.excerpt || news.description || 'Stay updated with latest news from Samajwadi Tech Force';

        const html = `
<!DOCTYPE html>
<html lang="hi" prefix="og: http://ogp.me/ns# article: http://ogp.me/ns/article#">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${title} - Samajwadi Tech Force</title>
    <meta name="title" content="${title}">
    <meta name="description" content="${description}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${shareUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Samajwadi Tech Force">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${shareUrl}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${imageUrl}">
    
    <!-- WhatsApp -->
    <meta property="og:image:alt" content="${title}">
    
    <!-- Redirect handling moved to bottom of body -->
    
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #E30512 0%, #009933 100%);
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            max-width: 600px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: #E30512;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: white;
        }
        h1 {
            color: #1e293b;
            margin-bottom: 16px;
            font-size: 24px;
        }
        .image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
            border-radius: 12px;
            margin: 20px 0;
        }
        p {
            color: #64748b;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .btn {
            display: inline-block;
            background: #E30512;
            color: white;
            padding: 12px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: scale(1.05);
        }
        .redirect-msg {
            font-size: 14px;
            color: #94a3b8;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚲</div>
        <h1>${title}</h1>
        ${news.coverImage ? `<img src="${news.coverImage}" alt="${title}" class="image">` : ''}
        <p>${description}</p>
        <a href="${redirectUrl}" class="btn">Open in App</a>
        <p class="redirect-msg">Redirecting to app in a few seconds...</p>
    </div>

    <script>
        // Check if the user is a bot/crawler
        const isBot = /bot|facebookexternalhit|whatsapp|googlebot|twitterbot|bingbot|linkedinbot/i.test(navigator.userAgent);
        
        if (!isBot) {
            // Only redirect real users
            setTimeout(() => {
                window.location.href = "${redirectUrl}";
            }, 3000); // 3-second delay to ensure smooth transition
        }
    </script>
</body>
</html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Error generating share page:', error);
        res.status(500).send('<h1>Error loading news</h1>');
    }
});

// @desc    Get shareable poster page
// @route   GET /share/poster
// @access  Public
router.get('/poster', async (req, res) => {
    try {
        const { image, title = 'Samajwadi Party Poster' } = req.query;

        if (!image) {
            return res.status(400).send('<h1>No image provided</h1>');
        }

        const appUrl = process.env.APP_URL || 'https://samajwaditechforce.com';
        const description = 'Created using Samajwadi Party Poster Editor';

        // Force HTTPS for production (Render uses reverse proxy)
        const pageUrl = `https://${req.get('host')}${req.originalUrl}`;

        // Optimize image for social media preview (Cloudinary only)
        // Resize to 1200x630 (Standard social size) and compress
        let previewImage = image;
        if (image.includes('cloudinary.com') && image.includes('/upload/')) {
            previewImage = image.replace('/upload/', '/upload/c_limit,w_1000,h_1000,q_auto,f_jpg/');
        }

        const html = `
<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${title}</title>
    <meta name="title" content="${title}">
    <meta name="description" content="${description}">
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://api-samajwaditechforce.onrender.com${req.originalUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${previewImage}">
    <meta property="og:image:secure_url" content="${previewImage}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1000">
    <meta property="og:image:height" content="1000">
    <meta property="og:image:alt" content="${title}">
    <meta property="og:site_name" content="Samajwadi Tech Force">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://api-samajwaditechforce.onrender.com${req.originalUrl}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${previewImage}">
    
    <style>
        body { 
            margin: 0; 
            background: linear-gradient(135deg, #E30512 0%, #009933 100%);
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
            overflow: hidden;
            padding: 20px;
            box-sizing: border-box;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        img { 
            max-width: 100%; 
            max-height: 80vh; 
            border-radius: 12px;
            display: block;
        }
        h1 {
            color: #1e293b;
            margin: 16px 0 8px;
            font-size: 20px;
            font-family: 'Segoe UI', sans-serif;
        }
        p {
            color: #64748b;
            font-size: 14px;
            margin: 0;
            font-family: 'Segoe UI', sans-serif;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="${image}" alt="${title}">
        <h1>${title}</h1>
        <p>${description}</p>
    </div>
</body>
</html>`;
        res.send(html);
    } catch (error) {
        res.status(500).send('Error');
    }
});


// @desc    Get shareable reel page
// @route   GET /share/reels/:id
// @access  Public
router.get('/reels/:id', async (req, res) => {
    try {
        // Need to require Reel model here since it wasn't imported at top level in original file
        const Reel = require('../models/Reel');
        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).send('<h1>Reel not found</h1>');
        }

        const appUrl = process.env.APP_URL || 'https://samajwaditechforce.com';
        const redirectUrl = `${appUrl}/reels?id=${reel._id}`;

        const currentHost = req.get('host');
        // Force https to satisfy social platforms
        const shareUrl = `https://${currentHost}${req.originalUrl}`;

        // Dynamic Image Preview
        let imageUrl = reel.thumbnailUrl || 'https://samajwaditechforce.com/assets/images/logo.png';
        if (imageUrl.startsWith('/')) {
            imageUrl = `https://${currentHost}${imageUrl}`;
        }

        // Optimize Cloudinary images for WhatsApp/FB (Standard: 600x600 for square or 1200x630 for landscape)
        if (imageUrl.includes('cloudinary.com') && imageUrl.includes('/upload/')) {
            imageUrl = imageUrl.replace('/upload/', '/upload/c_fill,w_600,h_600,q_auto,f_jpg/');
        }

        const title = reel.title || 'Samajwadi Tech Force Reel';
        const description = reel.description || 'Watch this reel on Samajwadi Tech Force';

        const html = `
<!DOCTYPE html>
<html lang="hi" prefix="og: http://ogp.me/ns#">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${title}</title>
    <meta name="title" content="${title}">
    <meta name="description" content="${description}">
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="video.other">
    <meta property="og:url" content="${shareUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="600">
    <meta property="og:image:height" content="600">
    <meta property="og:site_name" content="Samajwadi Tech Force">
    
    <!-- Video Specific -->
    <meta property="og:video" content="${reel.videoUrl}">
    <meta property="og:video:secure_url" content="${reel.videoUrl}">
    <meta property="og:video:type" content="video/mp4">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${shareUrl}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">

    <!-- Redirect handling moved to bottom of body -->
    
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #000;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            flex-direction: column;
        }
        .loader {
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid #E30512;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="loader"></div>
    <p>Opening Reel...</p>
    
    <script>
        // Check if the user is a bot/crawler
        const isBot = /bot|facebookexternalhit|whatsapp|googlebot|twitterbot|bingbot|linkedinbot/i.test(navigator.userAgent);
        
        if (!isBot) {
            // Only redirect real users
            setTimeout(() => {
                window.location.href = "${redirectUrl}";
            }, 1000); // Short delay for reels
        }
    </script>
</body>
</html>
        `;

        res.send(html);

    } catch (error) {
        console.error('Error generating reel share page:', error);
        res.status(500).send('<h1>Error loading reel</h1>');
    }
});

module.exports = router;
