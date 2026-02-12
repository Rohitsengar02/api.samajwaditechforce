const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');

// ─── R2 Client ───────────────────────────────────────────────
const r2 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.R2_BUCKET || 'samajwadi-media';
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

/**
 * Generate a unique key for a file
 */
const generateKey = (folder, originalName, ext) => {
    const timestamp = Date.now();
    const hash = crypto.randomBytes(8).toString('hex');
    const safeName = (originalName || 'file').replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
    return `${folder}/${timestamp}-${hash}-${safeName}${ext}`;
};

// ─── Image Compression with Sharp ───────────────────────────
/**
 * Compress image buffer to WebP with high quality
 * - Maintains best visual quality while reducing size by 60-80%
 * - Generates thumbnail version too
 */
const compressImage = async (inputBuffer, options = {}) => {
    const {
        maxWidth = 1920,
        maxHeight = 1920,
        quality = 82,         // Best balance: visually lossless but 60-80% smaller
        format = 'webp',
        generateThumbnail = false,
        thumbnailWidth = 400,
    } = options;

    try {
        const metadata = await sharp(inputBuffer).metadata();

        // Main optimized image
        let pipeline = sharp(inputBuffer)
            .rotate()  // Auto-rotate based on EXIF
            .resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true,
            });

        let outputBuffer;
        let contentType;
        let ext;

        if (format === 'webp') {
            outputBuffer = await pipeline.webp({ quality, effort: 4 }).toBuffer();
            contentType = 'image/webp';
            ext = '.webp';
        } else if (format === 'avif') {
            outputBuffer = await pipeline.avif({ quality, effort: 4 }).toBuffer();
            contentType = 'image/avif';
            ext = '.avif';
        } else if (format === 'jpeg' || format === 'jpg') {
            outputBuffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
            contentType = 'image/jpeg';
            ext = '.jpg';
        } else if (format === 'png') {
            outputBuffer = await pipeline.png({ quality, compressionLevel: 8 }).toBuffer();
            contentType = 'image/png';
            ext = '.png';
        } else {
            outputBuffer = await pipeline.webp({ quality, effort: 4 }).toBuffer();
            contentType = 'image/webp';
            ext = '.webp';
        }

        const result = {
            buffer: outputBuffer,
            contentType,
            ext,
            width: metadata.width,
            height: metadata.height,
            originalSize: inputBuffer.length,
            compressedSize: outputBuffer.length,
            savings: Math.round((1 - outputBuffer.length / inputBuffer.length) * 100),
        };

        // Generate thumbnail if requested
        if (generateThumbnail) {
            const thumbBuffer = await sharp(inputBuffer)
                .rotate()
                .resize(thumbnailWidth, null, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 70 })
                .toBuffer();

            result.thumbnail = {
                buffer: thumbBuffer,
                contentType: 'image/webp',
                ext: '.webp',
            };
        }

        return result;
    } catch (error) {
        console.error('❌ Image compression error:', error.message);
        // Fallback: return original buffer
        return {
            buffer: inputBuffer,
            contentType: 'application/octet-stream',
            ext: '.bin',
            originalSize: inputBuffer.length,
            compressedSize: inputBuffer.length,
            savings: 0,
        };
    }
};

// ─── Upload Functions ────────────────────────────────────────

/**
 * Upload image with automatic compression
 * Replaces: uploadImageOptimized from cloudinary.js
 */
const uploadImageToR2 = async (imageData, folder = 'images', options = {}) => {
    try {
        let inputBuffer;

        // Handle base64, Buffer, or file path
        if (typeof imageData === 'string') {
            if (imageData.startsWith('data:')) {
                // Base64 data URI
                const base64Data = imageData.split(',')[1] || imageData;
                inputBuffer = Buffer.from(base64Data, 'base64');
            } else if (imageData.startsWith('http')) {
                // URL - fetch and convert
                const response = await fetch(imageData);
                inputBuffer = Buffer.from(await response.arrayBuffer());
            } else {
                // Raw base64
                inputBuffer = Buffer.from(imageData, 'base64');
            }
        } else if (Buffer.isBuffer(imageData)) {
            inputBuffer = imageData;
        } else {
            throw new Error('Invalid image data format');
        }

        // Compress with sharp
        const compressed = await compressImage(inputBuffer, {
            quality: options.quality || 82,
            format: options.format || 'webp',
            maxWidth: options.maxWidth || 1920,
            maxHeight: options.maxHeight || 1920,
            generateThumbnail: options.generateThumbnail || false,
        });

        const key = generateKey(folder, options.filename || 'image', compressed.ext);

        // Upload main image
        await r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: compressed.buffer,
            ContentType: compressed.contentType,
        }));

        const url = `${PUBLIC_URL}/${key}`;
        const result = {
            url,
            key,
            width: compressed.width,
            height: compressed.height,
            bytes: compressed.compressedSize,
            originalBytes: compressed.originalSize,
            savings: compressed.savings,
        };

        // Upload thumbnail if generated
        if (compressed.thumbnail) {
            const thumbKey = key.replace(compressed.ext, `-thumb${compressed.thumbnail.ext}`);
            await r2.send(new PutObjectCommand({
                Bucket: BUCKET,
                Key: thumbKey,
                Body: compressed.thumbnail.buffer,
                ContentType: compressed.thumbnail.contentType,
            }));
            result.thumbnailUrl = `${PUBLIC_URL}/${thumbKey}`;
        }

        console.log(`✅ R2 Image Upload: ${url} (saved ${compressed.savings}%)`);
        return result;

    } catch (error) {
        console.error('❌ R2 image upload error:', error);
        throw new Error('Image upload failed: ' + error.message);
    }
};

/**
 * Upload base64 image to R2
 * Replaces: uploadBase64ToCloudinary from cloudinary.js
 */
const uploadBase64ToR2 = async (base64String, folder = 'images') => {
    try {
        const result = await uploadImageToR2(base64String, folder);
        return result.url;  // Return just the URL for backward compatibility
    } catch (error) {
        console.error('❌ R2 base64 upload error:', error);
        throw new Error('Image upload failed');
    }
};

/**
 * Upload video to R2 (no compression - served as-is via CDN)
 * Replaces: uploadVideoOptimized from cloudinary.js
 */
const uploadVideoToR2 = async (videoData, folder = 'videos', options = {}) => {
    try {
        let inputBuffer;
        let contentType = options.contentType || 'video/mp4';
        let ext = options.ext || '.mp4';

        if (typeof videoData === 'string') {
            if (videoData.startsWith('data:')) {
                const matches = videoData.match(/^data:(.+);base64,(.+)$/);
                if (matches) {
                    contentType = matches[1];
                    inputBuffer = Buffer.from(matches[2], 'base64');
                } else {
                    inputBuffer = Buffer.from(videoData.split(',')[1] || videoData, 'base64');
                }
            } else if (videoData.startsWith('http')) {
                const response = await fetch(videoData);
                inputBuffer = Buffer.from(await response.arrayBuffer());
            } else {
                inputBuffer = Buffer.from(videoData, 'base64');
            }
        } else if (Buffer.isBuffer(videoData)) {
            inputBuffer = videoData;
        } else {
            throw new Error('Invalid video data format');
        }

        // Detect extension from content type
        if (contentType.includes('webm')) ext = '.webm';
        else if (contentType.includes('quicktime') || contentType.includes('mov')) ext = '.mov';
        else if (contentType.includes('avi')) ext = '.avi';

        const key = generateKey(folder, options.filename || 'video', ext);

        await r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: inputBuffer,
            ContentType: contentType,
        }));

        const url = `${PUBLIC_URL}/${key}`;
        console.log(`✅ R2 Video Upload: ${url} (${(inputBuffer.length / 1024 / 1024).toFixed(1)}MB)`);

        return {
            url,
            key,
            bytes: inputBuffer.length,
            optimizedUrl: url,  // backward compatibility with cloudinary response
        };

    } catch (error) {
        console.error('❌ R2 video upload error:', error);
        throw new Error('Video upload failed: ' + error.message);
    }
};

/**
 * Upload any file (PDF, documents, etc.) to R2
 */
const uploadFileToR2 = async (buffer, folder = 'files', options = {}) => {
    try {
        const contentType = options.contentType || 'application/octet-stream';
        const ext = options.ext || path.extname(options.filename || '') || '';
        const key = generateKey(folder, options.filename || 'file', ext);

        await r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        }));

        const url = `${PUBLIC_URL}/${key}`;
        console.log(`✅ R2 File Upload: ${url}`);

        return { url, key, bytes: buffer.length };

    } catch (error) {
        console.error('❌ R2 file upload error:', error);
        throw new Error('File upload failed: ' + error.message);
    }
};

/**
 * Delete a file from R2
 * Replaces: cloudinary.uploader.destroy()
 */
const deleteFromR2 = async (keyOrUrl) => {
    try {
        let key = keyOrUrl;

        // If it's a full URL, extract the key
        if (keyOrUrl.startsWith('http')) {
            const url = new URL(keyOrUrl);
            key = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
        }

        await r2.send(new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key,
        }));

        console.log(`🗑️ R2 Delete: ${key}`);
        return true;
    } catch (error) {
        console.error('❌ R2 delete error:', error);
        return false;
    }
};

/**
 * Get optimized image URL (for backward compatibility)
 * With R2, the image is already optimized, so just return the URL
 */
const getOptimizedImageUrl = (publicIdOrUrl) => {
    if (publicIdOrUrl.startsWith('http')) return publicIdOrUrl;
    return `${PUBLIC_URL}/${publicIdOrUrl}`;
};

/**
 * Get optimized video URL (for backward compatibility)
 */
const getOptimizedVideoUrl = (publicIdOrUrl) => {
    if (publicIdOrUrl.startsWith('http')) return publicIdOrUrl;
    return `${PUBLIC_URL}/${publicIdOrUrl}`;
};

module.exports = {
    // Main upload functions
    uploadImageToR2,
    uploadBase64ToR2,
    uploadVideoToR2,
    uploadFileToR2,
    deleteFromR2,

    // Backward-compatible aliases
    uploadBase64ToCloudinary: uploadBase64ToR2,
    uploadImageOptimized: uploadImageToR2,
    uploadVideoOptimized: uploadVideoToR2,
    getOptimizedImageUrl,
    getOptimizedVideoUrl,

    // Utility
    compressImage,
};
