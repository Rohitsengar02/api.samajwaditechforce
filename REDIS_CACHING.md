# Redis Caching Implementation

This backend uses **Redis** for server-side caching (like Instagram, Facebook, Twitter) to reduce database load and improve performance.

## 🚀 Quick Start

### Option 1: Local Redis (Development)

1. **Install Redis:**
   ```bash
   # macOS
   brew install redis
   brew services start redis
   
   # Ubuntu/Debian
   sudo apt-get install redis-server
   sudo systemctl start redis
   
   # Windows (WSL recommended)
   # Download from https://redis.io/download
   ```

2. **Add to `.env`:**
   ```env
   REDIS_URL=redis://localhost:6379
   ```

3. **Start your server:**
   ```bash
   npm run dev
   ```

### Option 2: Cloud Redis (Production - Recommended)

#### Using Render.com (Free Tier Available)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Redis"
3. Choose a name (e.g., `samajwadi-cache`)
4. Select Free plan
5. Click "Create Redis"
6. Copy the "Internal Redis URL" 
7. Add to your `.env`:
   ```env
   REDIS_URL=redis://red-xxxxx:6379
   ```

#### Using Railway.app

1. Go to [Railway Dashboard](https://railway.app/)
2. New Project → Add Redis
3. Copy the Redis URL from variables
4. Add to `.env`:
   ```env
   REDIS_URL=redis://default:password@host:port
   ```

## 📊 What Gets Cached?

Currently caching is implemented for:

- **News API** (`/api/news`):
  - List: 5 minutes TTL
  - Single news: 10 minutes TTL
  
You can add caching to other routes following the same pattern.

## 🛠️ How to Add Caching to Other Routes

### Method 1: Using Middleware (Easiest)

```javascript
// In your route file (e.g., routes/members.js)
const { cacheMiddleware } = require('../utils/cache');

// Cache for 5 minutes
const MEMBERS_CACHE = cacheMiddleware('members', 5 * 60);

router.get('/', MEMBERS_CACHE, getMembers);
router.get('/:id', cacheMiddleware('member_single', 10 * 60), getSingleMember);
```

### Method 2: Manual Caching in Controllers

```javascript
const { getCache, setCache } = require('../utils/cache');

exports.getMembers = async (req, res) => {
    try {
        const cacheKey = 'members_list';
        
        // Try cache first
        const cached = await getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }
        
        // Fetch from database
        const members = await Member.find();
        
        // Cache for 5 minutes
        await setCache(cacheKey, members, 5 * 60);
        
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

### Cache Invalidation (Important!)

When data is modified, invalidate the cache:

```javascript
const { deleteCachePattern } = require('../utils/cache');

exports.createMember = async (req, res) => {
    const member = await Member.create(req.body);
    
    // Clear all member-related cache
    await deleteCachePattern('members');
    
    res.json(member);
};
```

## 📈 Benefits

- **🚀 Faster Response Times**: Cached data returns in ~1ms vs ~50-200ms from database
- **💪 Reduced Server Load**: Database queries reduced by 70-90%
- **💰 Lower Costs**: Fewer database operations = lower cloud costs
- **🌊 Handle Traffic Spikes**: Can serve 10x more requests

## 🔍 Monitoring

### Check Cache Stats

```bash
# Connect to Redis CLI
redis-cli

# Get stats
INFO stats
DBSIZE

# View all keys
KEYS *

# Clear all cache
FLUSHALL
```

### From Code

```javascript
const { getCacheStats } = require('../utils/cache');

const stats = await getCacheStats();
console.log(stats);
```

## ⚙️ Configuration

Cache TTL (Time To Live) recommendations:

- **Frequently changing data** (likes, views): 1-2 minutes  
- **Moderately changing data** (news, posts): 5-10 minutes  
- **Rarely changing data** (districts, templates): 30-60 minutes  
- **Static data** (settings, configs): 1-24 hours

## 🔒 Security

- Redis runs on localhost by default (secure)
- For cloud Redis, use the internal/private URL
- Never expose Redis port to public

## 🐛 Troubleshooting

**Issue**: Redis connection failed

**Solution**: App will continue working without cache. Check:
- Is Redis running? (`redis-cli ping` should return `PONG`)
- Is REDIS_URL correct in `.env`?
- Is Redis accessible from your server?

**Issue**: Stale data appearing

**Solution**: Cache invalidation is working. Either:
- Wait for TTL to expire
- Manually clear: `await deleteCachePattern('pattern')`
- Clear all: `await clearAllCache()`

## 📝 API Routes with Caching

| Endpoint | Cache TTL | Cache Key Pattern |
|----------|-----------|-------------------|
| GET /api/news | 5 min | `news_list:*` |
| GET /api/news/:id | 10 min | `news_single:*` |

*More routes will be added as caching is implemented*

## 🎯 Next Steps

1. ✅ Redis installed and configured
2. ✅ News API cached
3. ⏳ Add caching to Members API
4. ⏳ Add caching to Posters API
5. ⏳ Add caching to Districts API
6. ⏳ Monitor and optimize TTL values

---

**Need Help?** Check Redis docs: https://redis.io/docs/
