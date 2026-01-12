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

        const shareUrl = `${appUrl}/share/news/${news._id}`;
        const imageUrl = news.coverImage || `${appUrl}/default-news-image.jpg`;
        const title = news.title || 'Samajwadi Tech Force News';
        const description = news.excerpt || news.description || 'Stay updated with latest news from Samajwadi Tech Force';

        // Generate HTML with Open Graph meta tags
        const html = `
<!DOCTYPE html>
<html lang="hi">
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
    
    <!-- Redirect to app -->
    <meta http-equiv="refresh" content="3;url=${redirectUrl}">
    
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
        <p class="redirect-msg">Redirecting to app...</p>
    </div>
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

        const appUrl = process.env.APP_URL || 'https://samajwadiparty.in';
        const description = 'Created using Samajwadi Party Poster Editor';

        const html = `
<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${image}">
    <style>
        body { 
            margin: 0; 
            background: #ffffff; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
            overflow: hidden;
        }
        img { 
            max-width: 100%; 
            max-height: 100vh; 
            box-shadow: 0 0 50px rgba(0,0,0,0.5);
            display: block;
        }
    </style>
</head>
<body>
    <img src="${image}" alt="Poster">
</body>
</html>`;
        res.send(html);
    } catch (error) {
        res.status(500).send('Error');
    }
});

module.exports = router;
