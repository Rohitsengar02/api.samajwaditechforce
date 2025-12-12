const redis = require('redis');

// Redis client configuration
let redisClient = null;
let isRedisConnected = false;

// Default TTL (Time To Live) - 5 minutes
const DEFAULT_TTL = 5 * 60; // seconds

/**
 * Initialize Redis client
 */
async function initRedis() {
    try {
        // Create Redis client
        redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.log('❌ Redis: Max reconnection attempts reached');
                        return new Error('Max reconnection attempts');
                    }
                    return retries * 100; // Exponential backoff
                }
            }
        });

        // Event listeners
        redisClient.on('connect', () => {
            console.log('🔄 Redis: Connecting...');
        });

        redisClient.on('ready', () => {
            console.log('✅ Redis: Connected and ready');
            isRedisConnected = true;
        });

        redisClient.on('error', (err) => {
            console.error('❌ Redis Error:', err);
            isRedisConnected = false;
        });

        redisClient.on('end', () => {
            console.log('🔌 Redis: Connection closed');
            isRedisConnected = false;
        });

        // Connect to Redis
        await redisClient.connect();
    } catch (error) {
        console.error('❌ Redis initialization failed:', error);
        isRedisConnected = false;
    }
}

/**
 * Get data from cache
 */
async function getCache(key) {
    if (!isRedisConnected || !redisClient) {
        console.log('⚠️ Redis not available, skipping cache');
        return null;
    }

    try {
        const cached = await redisClient.get(key);
        if (cached) {
            console.log(`✅ Cache HIT: ${key}`);
            return JSON.parse(cached);
        }
        console.log(`❌ Cache MISS: ${key}`);
        return null;
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
}

/**
 * Set data in cache with TTL
 */
async function setCache(key, data, ttl = DEFAULT_TTL) {
    if (!isRedisConnected || !redisClient) {
        return false;
    }

    try {
        await redisClient.setEx(key, ttl, JSON.stringify(data));
        console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
        return true;
    } catch (error) {
        console.error('Cache set error:', error);
        return false;
    }
}

/**
 * Delete cache entry
 */
async function deleteCache(key) {
    if (!isRedisConnected || !redisClient) {
        return false;
    }

    try {
        await redisClient.del(key);
        console.log(`🗑️ Cache DELETED: ${key}`);
        return true;
    } catch (error) {
        console.error('Cache delete error:', error);
        return false;
    }
}

/**
 * Delete cache entries by pattern
 */
async function deleteCachePattern(pattern) {
    if (!isRedisConnected || !redisClient) {
        return false;
    }

    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`🗑️ Cache DELETED (pattern): ${pattern} (${keys.length} entries)`);
        }
        return true;
    } catch (error) {
        console.error('Cache delete pattern error:', error);
        return false;
    }
}

/**
 * Clear all cache
 */
async function clearAllCache() {
    if (!isRedisConnected || !redisClient) {
        return false;
    }

    try {
        await redisClient.flushAll();
        console.log('🗑️ ALL Cache CLEARED');
        return true;
    } catch (error) {
        console.error('Cache clear error:', error);
        return false;
    }
}

/**
 * Middleware for caching GET requests
 */
function cacheMiddleware(keyPrefix = '', ttl = DEFAULT_TTL) {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generate cache key
        const cacheKey = `${keyPrefix}:${req.originalUrl}`;

        try {
            // Try to get from cache
            const cached = await getCache(cacheKey);
            if (cached) {
                return res.json(cached);
            }

            // Store original res.json function
            const originalJson = res.json.bind(res);

            // Override res.json to cache response
            res.json = (data) => {
                // Cache the response
                setCache(cacheKey, data, ttl);
                return originalJson(data);
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
}

/**
 * Get cache statistics
 */
async function getCacheStats() {
    if (!isRedisConnected || !redisClient) {
        return { connected: false };
    }

    try {
        const info = await redisClient.info('stats');
        const dbSize = await redisClient.dbSize();

        return {
            connected: true,
            totalKeys: dbSize,
            info: info
        };
    } catch (error) {
        console.error('Cache stats error:', error);
        return { connected: false, error: error.message };
    }
}

module.exports = {
    initRedis,
    getCache,
    setCache,
    deleteCache,
    deleteCachePattern,
    clearAllCache,
    cacheMiddleware,
    getCacheStats,
    isRedisConnected: () => isRedisConnected
};
