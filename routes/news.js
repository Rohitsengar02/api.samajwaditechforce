const express = require('express');
const {
    getNews,
    getSingleNews,
    createNews,
    updateNews,
    deleteNews,
    likeNews,
    commentNews,
    shareNews
} = require('../controllers/newsController');

const router = express.Router();

router
    .route('/')
    .get(getNews)
    .post(createNews);

router
    .route('/:id')
    .get(getSingleNews)
    .put(updateNews)
    .delete(deleteNews);

router.route('/:id/like').put(likeNews);
router.route('/:id/comment').post(commentNews);
router.route('/:id/share').post(shareNews);

module.exports = router;
