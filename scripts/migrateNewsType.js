const mongoose = require('mongoose');
const dotenv = require('dotenv');
const News = require('../models/News');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

const migrateNewsType = async () => {
    try {
        await connectDB();

        console.log('🔄 Starting migration of News type...');

        // Update all news items that don't have a type or update ALL to 'News' based on user request "seed that field in all news"
        // I'll update all of them to be safe as per "add type - news for now"
        const result = await News.updateMany(
            {},
            { $set: { type: 'News' } }
        );

        console.log(`✅ Migration complete!`);
        console.log(`matchedCount: ${result.matchedCount}`);
        console.log(`modifiedCount: ${result.modifiedCount}`);

        process.exit();
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
};

migrateNewsType();
