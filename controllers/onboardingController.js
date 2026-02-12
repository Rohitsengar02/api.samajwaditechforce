const Onboarding = require('../models/Onboarding');
const { uploadImageToR2 } = require('../utils/r2');

// Get all slides
exports.getSlides = async (req, res) => {
    try {
        const slides = await Onboarding.find({ isActive: true }).sort({ order: 1 });
        res.json({ success: true, slides });
    } catch (error) {
        console.error('Error fetching onboarding slides:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Add new slide
exports.addSlide = async (req, res) => {
    try {
        console.log('=== ADD SLIDE REQUEST ===');
        console.log('Body:', req.body);
        console.log('File:', req.file ? 'Present' : 'Missing');

        const { title, description, gradient, order } = req.body;
        let imageUrl = '';

        if (req.file) {
            // Upload to R2 with compression
            const result = await uploadImageToR2(req.file.buffer, 'onboarding');
            imageUrl = result.url;
        } else if (req.body.imageUrl) {
            imageUrl = req.body.imageUrl;
        }

        if (!imageUrl) {
            return res.status(400).json({ success: false, error: 'Image is required' });
        }

        const newSlide = new Onboarding({
            title,
            description,
            imageUrl,
            gradient: gradient ? JSON.parse(gradient) : undefined,
            order: order || 0
        });

        await newSlide.save();
        res.json({ success: true, slide: newSlide });
    } catch (error) {
        console.error('Error adding onboarding slide:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Update slide
exports.updateSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, gradient, order, isActive } = req.body;

        let updateData = { title, description, order, isActive };
        if (gradient) updateData.gradient = JSON.parse(gradient);

        if (req.file) {
            const result = await uploadImageToR2(req.file.buffer, 'onboarding');
            updateData.imageUrl = result.url;
        }

        const slide = await Onboarding.findByIdAndUpdate(id, updateData, { new: true });

        if (!slide) {
            return res.status(404).json({ success: false, error: 'Slide not found' });
        }

        res.json({ success: true, slide });
    } catch (error) {
        console.error('Error updating onboarding slide:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Delete slide
exports.deleteSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const slide = await Onboarding.findByIdAndDelete(id);

        if (!slide) {
            return res.status(404).json({ success: false, error: 'Slide not found' });
        }

        res.json({ success: true, message: 'Slide deleted' });
    } catch (error) {
        console.error('Error deleting onboarding slide:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
