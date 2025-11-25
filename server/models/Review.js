const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    clientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    hairdresserProfileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'hairdresser_profiles',
            key: 'id'
        }
    },
    appointmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'appointments',
            key: 'id'
        }
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'reviews',
    timestamps: true
});

module.exports = Review;
