const express = require('express');
const {
    getResources,
    getSingleResource,
    createResource,
    updateResource,
    deleteResource,
    incrementDownload
} = require('../controllers/resourceController');

const router = express.Router();
const { cacheMiddleware } = require('../utils/cache');

router
    .route('/')
    .get(cacheMiddleware('resources_list', 10 * 60), getResources)  // 10 minutes cache
    .post(createResource);

router
    .route('/:id')
    .get(cacheMiddleware('resource', 10 * 60), getSingleResource)  // 10 minutes cache
    .put(updateResource)
    .delete(deleteResource);

router
    .route('/:id/download')
    .post(incrementDownload);

module.exports = router;
