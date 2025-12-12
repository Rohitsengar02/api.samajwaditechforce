const express = require('express');
const {
    getNews,
    getSingleNews,
    createNews,
    updateNews,
    deleteNews,
    likeNews,
    commentNews
} = require('../controllers/newsController');

const router = express.Router();
const { cacheMiddleware } = require('../utils/cache');

// Cache configuration: 5 minutes for news lists, 10 minutes for single news
const NEWS_LIST_CACHE = cacheMiddleware('news_list', 5 * 60); // 5 minutes
const NEWS_SINGLE_CACHE = cacheMiddleware('news_single', 10 * 60); // 10 minutes

router
    .route('/')
    .get(NEWS_LIST_CACHE, getNews)  // Cache enabled for GET
    .post(createNews);

router
    .route('/:id')
    .get(NEWS_SINGLE_CACHE, getSingleNews)  // Cache enabled for GET
    .put(updateNews)
    .delete(deleteNews);

router.route('/:id/like').put(likeNews);
router.route('/:id/comment').post(commentNews);

module.exports = router;
