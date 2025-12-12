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

router
    .route('/')
    .get(getResources)
    .post(createResource);

router
    .route('/:id')
    .get(getSingleResource)
    .put(updateResource)
    .delete(deleteResource);

router
    .route('/:id/download')
    .post(incrementDownload);

module.exports = router;
