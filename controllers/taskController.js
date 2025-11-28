const Task = require('../models/Task');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private/Admin
const getTasks = async (req, res) => {
    try {
        const { status, platform, page = 1, limit = 20 } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (platform) filter.platform = platform;

        const tasks = await Task.find(filter)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Task.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: tasks.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: tasks
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private/Admin
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('createdBy', 'name email');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
    try {
        const { title, description, platform, points, deadline, targetAudience, linkToShare, mediaUrl, type } = req.body;

        // Validation
        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: 'Task title is required' });
        }

        if (!platform) {
            return res.status(400).json({ success: false, message: 'Platform is required' });
        }

        // Create task
        const task = await Task.create({
            title: title.trim(),
            description: description?.trim() || '',
            platform,
            points: parseInt(points) || 10,
            deadline: deadline ? new Date(deadline) : null,
            targetAudience: targetAudience || 'All',
            linkToShare: linkToShare?.trim() || '',
            mediaUrl: mediaUrl?.trim() || '',
            type: type || 'Social Media',
            createdBy: req.user?._id,
            status: 'Active'
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task
        });
    } catch (error) {
        console.error('Error creating task:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private/Admin
const updateTask = async (req, res) => {
    try {
        const { title, description, platform, points, deadline, targetAudience, linkToShare, mediaUrl, type, status } = req.body;

        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Update fields
        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (platform !== undefined) updateData.platform = platform;
        if (points !== undefined) updateData.points = parseInt(points);
        if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
        if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
        if (linkToShare !== undefined) updateData.linkToShare = linkToShare.trim();
        if (mediaUrl !== undefined) updateData.mediaUrl = mediaUrl.trim();
        if (type !== undefined) updateData.type = type;
        if (status !== undefined) updateData.status = status;

        task = await Task.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: task
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        await task.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
            data: {}
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private/Admin
const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['Active', 'Expired'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Valid status is required (Active or Expired)' });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Task status updated successfully',
            data: task
        });
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus
};
