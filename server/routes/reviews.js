const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createReview,
    getHairdresserReviews,
    deleteReview
} = require('../controllers/reviewController');

// @route   POST /api/reviews
// @desc    Create review
// @access  Private
router.post('/', auth, createReview);

// @route   GET /api/reviews/hairdresser/:hairdresserProfileId
// @desc    Get reviews for a hairdresser
// @access  Public
router.get('/hairdresser/:hairdresserProfileId', getHairdresserReviews);

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', auth, deleteReview);

module.exports = router;
