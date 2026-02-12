const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Load env from parent directory or current
const { uploadImageToR2, uploadVideoToR2 } = require('../utils/r2');
const User = require('../models/User');
const Member = require('../models/Member');
const Poster = require('../models/Poster');
const Reel = require('../models/Reel');
const News = require('../models/News');
const Event = require('../models/Event');

// Configuration
const BATCH_SIZE = 5; // Process 5 items at a time to avoid memory spikes
const DELAY = 500; // Delay between batches

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const isCloudinaryUrl = (url) => {
    return url && url.includes('cloudinary.com');
};

const diffTime = (start) => ((Date.now() - start) / 1000).toFixed(2);

const migrateCollection = async (Model, fieldName, type = 'image', folder = 'migrated') => {
    console.log(`\n\n--- Migrating ${Model.modelName} (${fieldName}) ---`);
    const query = { [fieldName]: { $regex: 'cloudinary.com', $options: 'i' } };
    const total = await Model.countDocuments(query);
    console.log(`Found ${total} items to migrate.`);

    if (total === 0) return;

    let cursor = Model.find(query).cursor();
    let processed = 0;
    let success = 0;
    let failed = 0;

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        try {
            const oldUrl = doc[fieldName];
            console.log(`[${processed + 1}/${total}] Migrating ${oldUrl}...`);

            let result;
            const startTime = Date.now();

            if (type === 'image') {
                // uploadImageToR2 accepts URL string and handles download
                result = await uploadImageToR2(oldUrl, folder);
            } else if (type === 'video') {
                // uploadVideoToR2 accepts URL string and handles download
                result = await uploadVideoToR2(oldUrl, folder);
            }

            if (result && result.url) {
                doc[fieldName] = result.url;

                // Clear Cloudinary specific fields if they exist
                if (doc.cloudinaryPublicId) doc.cloudinaryPublicId = undefined;
                if (doc.cloudinary_id) doc.cloudinary_id = undefined;

                await doc.save();
                console.log(`   ✅ Done in ${diffTime(startTime)}s -> ${result.url}`);
                success++;
            } else {
                throw new Error('No URL returned from upload');
            }
        } catch (err) {
            console.error(`   ❌ Failed: ${err.message}`);
            failed++;
        }
        processed++;
    }

    console.log(`\n${Model.modelName} Migration Complete: ${success} success, ${failed} failed.`);
};

const runMigration = async () => {
    await connectDB();

    try {
        // Migrate Users (Profile Images)
        await migrateCollection(User, 'profileImage', 'image', 'users');

        // Migrate Members (Photos)
        await migrateCollection(Member, 'photo', 'image', 'members');

        // Migrate Posters (Images)
        await migrateCollection(Poster, 'imageUrl', 'image', 'posters');

        // Migrate News (Cover Images)
        await migrateCollection(News, 'coverImage', 'image', 'news');

        // Migrate Events (Images)
        await migrateCollection(Event, 'image', 'image', 'events');

        // Migrate Reels (Videos) - Warning: These can be large
        await migrateCollection(Reel, 'videoUrl', 'video', 'reels');
        await migrateCollection(Reel, 'thumbnail', 'image', 'reels-thumbs');

        console.log('\n\n✅ ALL MIGRATIONS COMPLETED');
        process.exit(0);
    } catch (err) {
        console.error('Migration Fatal Error:', err);
        process.exit(1);
    }
};

runMigration();


// # Navigate to your backend folder
//cd backend/api.samajwaditechforce

//# Run the migration script
// node scripts/migrate_cloudinary.js