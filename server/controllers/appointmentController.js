const { Appointment, User, HairdresserProfile, Service } = require('../models');
const { Op } = require('sequelize');

// Create appointment
exports.createAppointment = async (req, res) => {
    try {
        const { hairdresserProfileId, serviceId, appointmentDate, appointmentTime, notes } = req.body;

        // Validate service exists and get price
        const service = await Service.findByPk(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Check if hairdresser profile exists
        const hairdresserProfile = await HairdresserProfile.findByPk(hairdresserProfileId);
        if (!hairdresserProfile) {
            return res.status(404).json({ message: 'Hairdresser not found' });
        }

        // Check for existing appointment at same time
        const existingAppointment = await Appointment.findOne({
            where: {
                hairdresserProfileId,
                appointmentDate,
                appointmentTime,
                status: {
                    [Op.in]: ['pending', 'confirmed']
                }
            }
        });

        if (existingAppointment) {
            return res.status(400).json({ message: 'This time slot is already booked' });
        }

        // Create appointment
        const appointment = await Appointment.create({
            clientId: req.user.id,
            hairdresserProfileId,
            serviceId,
            appointmentDate,
            appointmentTime,
            totalPrice: service.price,
            notes,
            paymentMethod: req.body.paymentMethod || 'cash',
            status: 'pending'
        });

        // Fetch complete appointment with relations
        const completeAppointment = await Appointment.findByPk(appointment.id, {
            include: [
                {
                    model: User,
                    as: 'client',
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: HairdresserProfile,
                    as: 'hairdresserProfile',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'phone']
                    }]
                },
                {
                    model: Service,
                    as: 'service'
                }
            ]
        });

        res.status(201).json(completeAppointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get user's appointments
exports.getMyAppointments = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        let where = {};
        if (user.role === 'hairdresser') {
            // Get hairdresser profile
            const profile = await HairdresserProfile.findOne({ where: { userId: req.user.id } });
            if (!profile) {
                return res.json([]);
            }
            where.hairdresserProfileId = profile.id;
        } else {
            where.clientId = req.user.id;
        }

        const appointments = await Appointment.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'client',
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: HairdresserProfile,
                    as: 'hairdresserProfile',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'phone']
                    }]
                },
                {
                    model: Service,
                    as: 'service'
                }
            ],
            order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']]
        });

        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'client',
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: HairdresserProfile,
                    as: 'hairdresserProfile',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'phone']
                    }]
                },
                {
                    model: Service,
                    as: 'service'
                }
            ]
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status, cancellationReason } = req.body;

        const appointment = await Appointment.findByPk(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify user has permission
        const user = await User.findByPk(req.user.id);
        if (user.role === 'hairdresser') {
            const profile = await HairdresserProfile.findOne({ where: { userId: req.user.id } });
            if (!profile || appointment.hairdresserProfileId !== profile.id) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        } else if (appointment.clientId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        appointment.status = status;
        if (cancellationReason) {
            appointment.cancellationReason = cancellationReason;
        }
        await appointment.save();

        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get available time slots for a hairdresser on a specific date
exports.getAvailableSlots = async (req, res) => {
    try {
        const { hairdresserProfileId, date } = req.query;

        if (!hairdresserProfileId || !date) {
            return res.status(400).json({ message: 'Hairdresser ID and date are required' });
        }

        // Get existing appointments for that day
        const existingAppointments = await Appointment.findAll({
            where: {
                hairdresserProfileId,
                appointmentDate: date,
                status: {
                    [Op.in]: ['pending', 'confirmed']
                }
            },
            attributes: ['appointmentTime']
        });

        const bookedTimes = existingAppointments.map(apt => apt.appointmentTime);

        // Generate time slots (9:00 - 18:00, every 30 minutes)
        const slots = [];
        for (let hour = 9; hour < 18; hour++) {
            for (let minute of [0, 30]) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
                if (!bookedTimes.includes(time)) {
                    slots.push(time);
                }
            }
        }

        res.json({ availableSlots: slots });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
