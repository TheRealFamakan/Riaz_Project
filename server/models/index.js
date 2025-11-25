const User = require('../models/User');
const HairdresserProfile = require('../models/HairdresserProfile');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');

// User - HairdresserProfile relationship
User.hasOne(HairdresserProfile, {
    foreignKey: 'userId',
    as: 'hairdresserProfile'
});

HairdresserProfile.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// HairdresserProfile - Service relationship
HairdresserProfile.hasMany(Service, {
    foreignKey: 'hairdresserProfileId',
    as: 'services'
});

Service.belongsTo(HairdresserProfile, {
    foreignKey: 'hairdresserProfileId',
    as: 'hairdresserProfile'
});

// Appointment relationships
Appointment.belongsTo(User, {
    foreignKey: 'clientId',
    as: 'client'
});

Appointment.belongsTo(HairdresserProfile, {
    foreignKey: 'hairdresserProfileId',
    as: 'hairdresserProfile'
});

Appointment.belongsTo(Service, {
    foreignKey: 'serviceId',
    as: 'service'
});

User.hasMany(Appointment, {
    foreignKey: 'clientId',
    as: 'appointments'
});

HairdresserProfile.hasMany(Appointment, {
    foreignKey: 'hairdresserProfileId',
    as: 'appointments'
});

// Review relationships
Review.belongsTo(User, {
    foreignKey: 'clientId',
    as: 'client'
});

Review.belongsTo(HairdresserProfile, {
    foreignKey: 'hairdresserProfileId',
    as: 'hairdresserProfile'
});

Review.belongsTo(Appointment, {
    foreignKey: 'appointmentId',
    as: 'appointment'
});

User.hasMany(Review, {
    foreignKey: 'clientId',
    as: 'reviews'
});

HairdresserProfile.hasMany(Review, {
    foreignKey: 'hairdresserProfileId',
    as: 'reviews'
});

module.exports = {
    User,
    HairdresserProfile,
    Service,
    Appointment,
    Review
};
