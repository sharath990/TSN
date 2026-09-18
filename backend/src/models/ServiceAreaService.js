const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceAreaService = sequelize.define('ServiceAreaService', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  service_area_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  service_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'service_area_services',
  indexes: [
    { unique: true, fields: ['service_area_id', 'service_id'] },
    { fields: ['service_id'] },
  ],
});

module.exports = ServiceAreaService;
