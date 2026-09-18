const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceSubCategory = sequelize.define('ServiceSubCategory', {
  service_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  subcategory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
}, {
  tableName: 'service_subcategories',
  timestamps: false,
});

module.exports = ServiceSubCategory;
