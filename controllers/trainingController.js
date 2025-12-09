const TrainingModule = require('../models/TrainingModule');

// @desc    Get all training modules
// @route   GET /api/training
// @access  Private/Admin
const getModules = async (req, res) => {
    try {
        const modules = await TrainingModule.find({}).sort({ createdAt: -1 });
        res.json(modules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single training module by ID
// @route   GET /api/training/:id
// @access  Private/Admin
const getModuleById = async (req, res) => {
    try {
        const module = await TrainingModule.findById(req.params.id);

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        res.json(module);
    } catch (error) {
        console.error('Error fetching module:', error);
        res.status(500).json({ success: false, message: error.message });
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

// @desc    Update a training module
// @route   PUT /api/training/:id
// @access  Private/Admin
const updateModule = async (req, res) => {
    try {
        const { title, description, phase, type, contentUrl, duration } = req.body;

        const module = await TrainingModule.findById(req.params.id);

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // Update fields
        module.title = title || module.title;
        module.description = description !== undefined ? description : module.description;
        module.phase = phase || module.phase;
        module.type = type || module.type;
        module.contentUrl = contentUrl !== undefined ? contentUrl : module.contentUrl;
        module.duration = duration !== undefined ? duration : module.duration;

        const updatedModule = await module.save();

        res.json({
            success: true,
            message: 'Module updated successfully',
            data: updatedModule
        });
    } catch (error) {
        console.error('Error updating module:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a training module
// @route   DELETE /api/training/:id
// @access  Private/Admin
const deleteModule = async (req, res) => {
    try {
        const module = await TrainingModule.findById(req.params.id);

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        await TrainingModule.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Module deleted successfully' });
    } catch (error) {
        console.error('Error deleting module:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getModules, getModuleById, createModule, updateModule, deleteModule };
