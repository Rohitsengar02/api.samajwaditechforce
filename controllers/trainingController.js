const TrainingModule = require('../models/TrainingModule');

// @desc    Get all training modules
// @route   GET /api/training
// @access  Private/Admin
const getModules = async (req, res) => {
    try {
        const modules = await TrainingModule.find({});
        res.json(modules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a training module
// @route   POST /api/training
// @access  Private/Admin
const createModule = async (req, res) => {
    try {
        const { title, description, phase, type, contentUrl, duration } = req.body;

        if (!title || !phase || !type) {
            return res.status(400).json({ success: false, message: 'Please provide title, phase, and type' });
        }

        const module = await TrainingModule.create({
            title,
            description,
            phase,
            type,
            contentUrl,
            duration,
            // createdBy: req.user._id, // Auth disabled for now
        });

        if (module) {
            res.status(201).json({
                success: true,
                message: 'Training module created successfully',
                data: module
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid module data' });
        }
    } catch (error) {
        console.error('Error creating training module:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getModules, createModule };
