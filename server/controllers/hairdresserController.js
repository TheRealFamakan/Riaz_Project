const { HairdresserProfile, Service, User } = require('../models');
const { Op } = require('sequelize');

// Create hairdresser profile
exports.createProfile = async (req, res) => {
    try {
        const { bio, experience, city, neighborhood, serviceArea, services } = req.body;

        // Check if user is a hairdresser
        const user = await User.findByPk(req.user.id);
        if (user.role !== 'hairdresser') {
            return res.status(403).json({ message: 'Only hairdressers can create a profile' });
        }

        // Check if profile already exists
        const existingProfile = await HairdresserProfile.findOne({ where: { userId: req.user.id } });
        if (existingProfile) {
            return res.status(400).json({ message: 'Profile already exists. Use update instead.' });
        }

        // Create profile
        const profile = await HairdresserProfile.create({
            userId: req.user.id,
            bio,
            experience,
            city,
            neighborhood,
            serviceArea
        });

        // Create services if provided
        if (services && Array.isArray(services)) {
            await Promise.all(
                services.map(service =>
                    Service.create({
                        hairdresserProfileId: profile.id,
                        ...service
                    })
                )
            );
        }

        // Fetch complete profile with services
        const completeProfile = await HairdresserProfile.findByPk(profile.id, {
            include: [{ model: Service, as: 'services' }]
        });

        res.status(201).json(completeProfile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update hairdresser profile
exports.updateProfile = async (req, res) => {
    try {
        const { bio, experience, city, neighborhood, serviceArea, portfolio } = req.body;

        const profile = await HairdresserProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Update fields
        if (bio !== undefined) profile.bio = bio;
        if (experience !== undefined) profile.experience = experience;
        if (city !== undefined) profile.city = city;
        if (neighborhood !== undefined) profile.neighborhood = neighborhood;
        if (serviceArea !== undefined) profile.serviceArea = serviceArea;
        if (portfolio !== undefined) profile.portfolio = portfolio;

        await profile.save();

        const updatedProfile = await HairdresserProfile.findByPk(profile.id, {
            include: [{ model: Service, as: 'services' }]
        });

        res.json(updatedProfile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get hairdresser profile by ID
exports.getProfile = async (req, res) => {
    try {
        const profile = await HairdresserProfile.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'phone', 'avatar', 'verified']
                },
                {
                    model: Service,
                    as: 'services',
                    where: { isActive: true },
                    required: false
                }
            ]
        });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Search hairdressers
exports.searchHairdressers = async (req, res) => {
    try {
        const {
            city,
            neighborhood,
            service,
            minPrice,
            maxPrice,
            minRating,
            page = 1,
            limit = 100 // Augmenté pour avoir plus de résultats
        } = req.query;

        const offset = (page - 1) * limit;
        const where = { isActive: true };

        // Location filters
        if (city) where.city = { [Op.iLike]: `%${city}%` };
        if (neighborhood) where.neighborhood = { [Op.iLike]: `%${neighborhood}%` };
        if (minRating) where.averageRating = { [Op.gte]: parseFloat(minRating) };

        // Service and price filters
        const serviceWhere = { isActive: true };
        if (service) serviceWhere.category = service;
        if (minPrice || maxPrice) {
            serviceWhere.price = {};
            if (minPrice) serviceWhere.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) serviceWhere.price[Op.lte] = parseFloat(maxPrice);
        }

        const { count, rows } = await HairdresserProfile.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'avatar', 'verified']
                },
                {
                    model: Service,
                    as: 'services',
                    where: serviceWhere,
                    required: false // Ne pas exiger de services pour afficher le coiffeur
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['averageRating', 'DESC'], ['totalReviews', 'DESC']]
        });

        res.json({
            hairdressers: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Add or update service
exports.manageService = async (req, res) => {
    try {
        const { serviceId, name, description, price, duration, category } = req.body;

        const profile = await HairdresserProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        let service;
        if (serviceId) {
            // Update existing service
            service = await Service.findOne({
                where: { id: serviceId, hairdresserProfileId: profile.id }
            });
            if (!service) {
                return res.status(404).json({ message: 'Service not found' });
            }
            await service.update({ name, description, price, duration, category });
        } else {
            // Create new service
            service = await Service.create({
                hairdresserProfileId: profile.id,
                name,
                description,
                price,
                duration,
                category
            });
        }

        res.json(service);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Delete service
exports.deleteService = async (req, res) => {
    try {
        const profile = await HairdresserProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const service = await Service.findOne({
            where: { id: req.params.serviceId, hairdresserProfileId: profile.id }
        });

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        await service.destroy();
        res.json({ message: 'Service deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
