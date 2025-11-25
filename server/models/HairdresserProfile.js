const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HairdresserProfile = sequelize.define('HairdresserProfile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    experience: {
        type: DataTypes.INTEGER, // years of experience
        allowNull: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    neighborhood: {
        type: DataTypes.STRING,
        allowNull: true
    },
    serviceArea: {
        type: DataTypes.STRING, // e.g., "5km radius"
        allowNull: true
    },
    portfolio: {
        type: DataTypes.JSON, // array of image URLs
        defaultValue: []
    },
    averageRating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.0
    },
    totalReviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'hairdresser_profiles',
    timestamps: true
});

module.exports = HairdresserProfile;
