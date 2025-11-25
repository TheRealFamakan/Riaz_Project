const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
    getStats,
    getAllUsers,
    toggleUserStatus,
    deleteUser,
    getAllAppointments,
    changeUserRole,
    updateAppointmentStatus,
    deleteAppointment
} = require('../controllers/adminController');

// All routes require authentication AND admin role
router.get('/stats', auth, admin, getStats);
router.get('/users', auth, admin, getAllUsers);
router.put('/users/:id/toggle', auth, admin, toggleUserStatus);
router.put('/users/:id/role', auth, admin, changeUserRole);
router.delete('/users/:id', auth, admin, deleteUser);
router.get('/appointments', auth, admin, getAllAppointments);
router.put('/appointments/:id/status', auth, admin, updateAppointmentStatus);
router.delete('/appointments/:id', auth, admin, deleteAppointment);

module.exports = router;
