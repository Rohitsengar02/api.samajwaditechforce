const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '../.env' }); // Load env from parent directory

// Configure R2 Client
const r2 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.R2_BUCKET || 'samajwadi-media';

const setCorsPolicy = async () => {
    console.log(`Configuring CORS for bucket: ${BUCKET}...`);

    const corsParams = {
        Bucket: BUCKET,
        CORSConfiguration: {
            CORSRules: [
                {
                    // Allow all origins (for public access and editor tools)
                    AllowedOrigins: ['*'],
                    // Allow GET and HEAD for viewing/downloading images
                    AllowedMethods: ['GET', 'HEAD'],
                    // Allow all headers
                    AllowedHeaders: ['*'],
                    // Cache the response for 1 hour
                    MaxAgeSeconds: 3600
                }
            ]
        }
    };

    try {
        await r2.send(new PutBucketCorsCommand(corsParams));
        console.log('✅ Successfully updated CORS policy for R2 bucket.');
        console.log('Images should now render correctly in canvas and downloads.');
    } catch (err) {
        console.error('❌ Error setting CORS policy:', err);
    }
};

setCorsPolicy();
