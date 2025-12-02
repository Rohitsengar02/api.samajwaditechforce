const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', onboardingController.getSlides);
router.post('/', upload.single('image'), onboardingController.addSlide);
router.put('/:id', upload.single('image'), onboardingController.updateSlide);
router.delete('/:id', onboardingController.deleteSlide);

module.exports = router;
