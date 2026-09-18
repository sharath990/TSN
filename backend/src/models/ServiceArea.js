const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceArea = sequelize.define('ServiceArea', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  center_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },
  center_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
  },
  radius_km: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 10.00,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'service_areas',
  indexes: [
    { fields: ['is_active'] },
  ],
});

module.exports = ServiceArea;
