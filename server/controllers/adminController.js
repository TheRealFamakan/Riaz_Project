const { User, HairdresserProfile, Appointment, Service, Review } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get dashboard statistics
exports.getStats = async (req, res) => {
    try {
        // Total counts
        const totalUsers = await User.count();
        const totalClients = await User.count({ where: { role: 'client' } });
        const totalHairdressers = await User.count({ where: { role: 'hairdresser' } });
        const totalAppointments = await Appointment.count();
        const totalRevenue = await Appointment.sum('totalPrice', {
            where: { status: 'completed' }
        });

        // Recent stats (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentAppointments = await Appointment.count({
            where: {
                createdAt: { [Op.gte]: thirtyDaysAgo }
            }
        });

        const recentUsers = await User.count({
            where: {
                createdAt: { [Op.gte]: thirtyDaysAgo }
            }
        });

        // Appointments by status
        const appointmentsByStatus = await Appointment.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status']
        });

        res.json({
            totalUsers,
            totalClients,
            totalHairdressers,
            totalAppointments,
            totalRevenue: parseFloat(totalRevenue || 0).toFixed(2),
            recentAppointments,
            recentUsers,
            appointmentsByStatus
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (role) where.role = role;
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            attributes: ['id', 'name', 'email', 'phone', 'role', 'verified', 'createdAt'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            users: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Toggle user active status
exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Don't allow deactivating admins
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot modify admin users' });
        }

        user.verified = !user.verified;
        await user.save();

        res.json({ message: 'User status updated', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get all appointments with pagination
exports.getAllAppointments = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (status) where.status = status;

        const { count, rows } = await Appointment.findAndCountAll({
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
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']]
        });

        res.json({
            appointments: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin users' });
        }

        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Change user role (admin only)
exports.changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['client', 'hairdresser', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({ message: 'User role updated successfully', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update appointment status (admin only)
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const appointment = await Appointment.findByPk(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = status;
        await appointment.save();

        res.json({ message: 'Appointment status updated successfully', appointment });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Delete appointment (admin only)
exports.deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        await appointment.destroy();
        res.json({ message: 'Appointment deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
