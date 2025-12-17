const mongoose = require('mongoose');
const News = require('../models/News');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from parent directory (backend)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const checkNewsId = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const idToCheck = '694246f073668d075b6c5297';
        console.log(`Checking for ID: ${idToCheck}`);

        const news = await News.findById(idToCheck);
        if (news) {
            console.log('Found News Item:', news);
        } else {
            console.log('News Item NOT FOUND by ID');
        }

        // Also list all news to see what IDs are there
        const allNews = await News.find({}, '_id type title');
        console.log('All News Items:');
        allNews.forEach(n => {
            console.log(`- ${n._id} [${n.type}] : ${n.title}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
};

checkNewsId();
