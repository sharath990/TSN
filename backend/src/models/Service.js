const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { SERVICE_STATUS } = require('../config/constants');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
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
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in minutes',
    validate: { min: 15 },
  },
  status: {
    type: DataTypes.ENUM(SERVICE_STATUS.ACTIVE, SERVICE_STATUS.INACTIVE),
    allowNull: false,
    defaultValue: SERVICE_STATUS.ACTIVE,
  },
}, {
  tableName: 'services',
});

module.exports = Service;
