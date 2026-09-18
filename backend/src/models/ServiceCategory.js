const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { CATEGORY_STATUS } = require('../config/constants');

const ServiceCategory = sequelize.define('ServiceCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: { notEmpty: true },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM(CATEGORY_STATUS.ACTIVE, CATEGORY_STATUS.INACTIVE),
    allowNull: false,
    defaultValue: CATEGORY_STATUS.ACTIVE,
  },
}, {
  tableName: 'service_categories',
});

module.exports = ServiceCategory;
