const express = require('express');
const router = express.Router();
const {
    getHomeContent,
    updateHomeContent,
    updateHeroSection,
    updateTrackRecord,
    updatePresident,
    updateLegacy,
    updatePrograms,
    updateExplorePages,
    resetToDefault
} = require('../controllers/homeContentController');

// Public routes
router.get('/', getHomeContent);

// Admin routes (Auth can be added later)
router.put('/', updateHomeContent);
router.put('/hero', updateHeroSection);
router.put('/track-record', updateTrackRecord);
router.put('/president', updatePresident);
router.put('/legacy', updateLegacy);
router.put('/programs', updatePrograms);
router.put('/explore-pages', updateExplorePages);
router.post('/reset', resetToDefault);

module.exports = router;
