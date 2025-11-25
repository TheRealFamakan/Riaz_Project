const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createProfile,
    updateProfile,
    getProfile,
    searchHairdressers,
    manageService,
    deleteService
} = require('../controllers/hairdresserController');

// @route   POST /api/hairdressers/profile
// @desc    Create hairdresser profile
// @access  Private (hairdresser only)
router.post('/profile', auth, createProfile);

// @route   PUT /api/hairdressers/profile
// @desc    Update hairdresser profile
// @access  Private (hairdresser only)
router.put('/profile', auth, updateProfile);

// @route   GET /api/hairdressers/:id
// @desc    Get hairdresser profile by ID
// @access  Public
router.get('/:id', getProfile);

// @route   GET /api/hairdressers/search
// @desc    Search hairdressers with filters
// @access  Public
router.get('/', searchHairdressers);

// @route   POST /api/hairdressers/services
// @desc    Add or update service
// @access  Private (hairdresser only)
router.post('/services', auth, manageService);

// @route   DELETE /api/hairdressers/services/:serviceId
// @desc    Delete service
// @access  Private (hairdresser only)
router.delete('/services/:serviceId', auth, deleteService);

module.exports = router;
