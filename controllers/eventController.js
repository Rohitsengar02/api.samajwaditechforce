const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const User = require('../models/User');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    try {
        const events = await Event.find({ isActive: true }).sort({ date: -1 });
        res.json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events',
            error: error.message
        });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching event',
            error: error.message
        });
    }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            time,
            location,
            status,
            attendees,
            type,
            updates,
            image
        } = req.body;

        const event = await Event.create({
            title,
            description,
            date,
            time,
            location,
            status,
            attendees,
            type,
            updates,
            image
        });

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating event',
            error: error.message
        });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            message: 'Event updated successfully',
            data: updatedEvent
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating event',
            error: error.message
        });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Soft delete - set isActive to false
        event.isActive = false;
        await event.save();

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting event',
            error: error.message
        });
    }
};

// @desc    Get events by status
// @route   GET /api/events/status/:status
// @access  Public
const getEventsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const events = await Event.find({ status, isActive: true }).sort({ date: -1 });

        res.json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error fetching events by status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events',
            error: error.message
        });
    }
};

// @desc    Register user for event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        const eventId = req.params.id;
        const userId = req.user._id;

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check if already registered
        const existingRegistration = await EventRegistration.findOne({
            user: userId,
            event: eventId
        });

        if (existingRegistration) {
            return res.status(400).json({ success: false, message: 'You have already registered for this event' });
        }

        // Create registration
        const registration = await EventRegistration.create({
            user: userId,
            event: eventId,
            name,
            email,
            phone,
            address
        });

        // Update user address if provided to keep profile in sync
        if (address) {
            const user = await User.findById(userId);
            if (user) {
                user.address = address;
                await user.save();
            }
        }

        // Increment event attendees
        event.attendees = (event.attendees || 0) + 1;
        await event.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: registration
        });
    } catch (error) {
        console.error('Error registering for event:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering for event',
            error: error.message
        });
    }
};

// @desc    Get all registrations (Admin)
// @route   GET /api/events/registrations/all
// @access  Private/Admin
const getAllRegistrations = async (req, res) => {
    try {
        const registrations = await EventRegistration.find({})
            .populate('user', 'name email phone profileImage')
            .populate('event', 'title date time location image')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: registrations.length,
            data: registrations
        });
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching registrations',
            error: error.message
        });
    }
};

// @desc    Update registration status
// @route   PUT /api/events/registrations/:id
// @access  Private/Admin
const updateRegistrationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const registration = await EventRegistration.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'name').populate('event', 'title');

        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        res.json({
            success: true,
            message: 'Status updated',
            data: registration
        });
    } catch (error) {
        console.error('Error updating registration:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating registration',
            error: error.message
        });
    }
};

// @desc    Delete registration
// @route   DELETE /api/events/registrations/:id
// @access  Private/Admin
const deleteRegistration = async (req, res) => {
    try {
        const registration = await EventRegistration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        // Decrement attendee count
        await Event.findByIdAndUpdate(registration.event, { $inc: { attendees: -1 } });

        await EventRegistration.deleteOne({ _id: req.params.id });

        res.json({
            success: true,
            message: 'Registration deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting registration:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting registration',
            error: error.message
        });
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsByStatus,
    registerForEvent,
    getAllRegistrations,
    updateRegistrationStatus,
    deleteRegistration
};
