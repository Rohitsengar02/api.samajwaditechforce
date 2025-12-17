const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getEvents);
router.get('/status/:status', getEventsByStatus);
router.get('/:id', getEventById);

// Protected/Admin routes
router.post('/', protect, admin, createEvent);
router.put('/:id', protect, admin, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);
router.post('/:id/register', protect, registerForEvent);


// Registration Management Routes
router.get('/registrations/all', protect, admin, getAllRegistrations);
router.put('/registrations/:id', protect, admin, updateRegistrationStatus);
router.delete('/registrations/:id', protect, admin, deleteRegistration);

module.exports = router;
