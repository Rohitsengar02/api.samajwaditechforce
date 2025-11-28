const Resource = require('../models/Resource');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
exports.getResources = async (req, res, next) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};

        const resources = await Resource.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: resources.length,
            data: resources
        });
    } catch (err) {
        console.error('Error fetching resources:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
exports.getSingleResource = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }

        // Increment views
        resource.views += 1;
        await resource.save();

        res.status(200).json({
            success: true,
            data: resource
        });
    } catch (err) {
        console.error('Error fetching resource:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private (Admin)
exports.createResource = async (req, res, next) => {
    try {
        console.log('=== CREATE RESOURCE REQUEST ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const resource = await Resource.create(req.body);

        console.log('Resource created successfully:', resource._id);

        res.status(201).json({
            success: true,
            data: resource
        });
    } catch (err) {
        console.error('=== CREATE RESOURCE ERROR ===');
        console.error('Error:', err);

        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error: ' + err.message });
    }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Admin)
exports.updateResource = async (req, res, next) => {
    try {
        let resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }

        resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: resource
        });
    } catch (err) {
        console.error('Error updating resource:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin)
exports.deleteResource = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }

        await resource.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error('Error deleting resource:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Increment download count
// @route   POST /api/resources/:id/download
// @access  Public
exports.incrementDownload = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }

        resource.downloads += 1;
        await resource.save();

        res.status(200).json({
            success: true,
            data: resource
        });
    } catch (err) {
        console.error('Error incrementing download:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
