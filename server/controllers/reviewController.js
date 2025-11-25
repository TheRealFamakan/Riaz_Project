const { Review, HairdresserProfile, User } = require('../models');

// Create review
exports.createReview = async (req, res) => {
    try {
        const { hairdresserProfileId, appointmentId, rating, comment } = req.body;

        // Check if user already reviewed this hairdresser
        const existingReview = await Review.findOne({
            where: {
                clientId: req.user.id,
                hairdresserProfileId
            }
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this hairdresser' });
        }

        // Create review
        const review = await Review.create({
            clientId: req.user.id,
            hairdresserProfileId,
            appointmentId,
            rating,
            comment
        });

        // Update hairdresser average rating
        await updateHairdresserRating(hairdresserProfileId);

        // Fetch complete review
        const completeReview = await Review.findByPk(review.id, {
            include: [{
                model: User,
                as: 'client',
                attributes: ['id', 'name', 'avatar']
            }]
        });

        res.status(201).json(completeReview);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get reviews for a hairdresser
exports.getHairdresserReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { hairdresserProfileId: req.params.hairdresserProfileId },
            include: [{
                model: User,
                as: 'client',
                attributes: ['id', 'name', 'avatar']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update hairdresser average rating
const updateHairdresserRating = async (hairdresserProfileId) => {
    const reviews = await Review.findAll({
        where: { hairdresserProfileId },
        attributes: ['rating']
    });

    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await HairdresserProfile.update(
        {
            averageRating: averageRating.toFixed(2),
            totalReviews: reviews.length
        },
        { where: { id: hairdresserProfileId } }
    );
};

// Delete review
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.clientId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const hairdresserProfileId = review.hairdresserProfileId;
        await review.destroy();

        // Update hairdresser rating
        await updateHairdresserRating(hairdresserProfileId);

        res.json({ message: 'Review deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
