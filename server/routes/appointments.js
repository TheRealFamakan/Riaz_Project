const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createAppointment,
    getMyAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    getAvailableSlots
} = require('../controllers/appointmentController');

// @route   POST /api/appointments
// @desc    Create appointment
// @access  Private
router.post('/', auth, createAppointment);

// @route   GET /api/appointments
// @desc    Get my appointments
// @access  Private
router.get('/', auth, getMyAppointments);

// @route   GET /api/appointments/slots
// @desc    Get available time slots
// @access  Public
router.get('/slots', getAvailableSlots);

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', auth, getAppointmentById);

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Private
router.put('/:id/status', auth, updateAppointmentStatus);

module.exports = router;
