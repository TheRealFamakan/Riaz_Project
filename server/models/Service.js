const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    hairdresserProfileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'hairdresser_profiles',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER, // duration in minutes
        allowNull: true
    },
    category: {
        type: DataTypes.ENUM('coupe', 'coloration', 'brushing', 'barbe', 'soin', 'autre'),
        defaultValue: 'autre'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'services',
    timestamps: true
});

module.exports = Service;
