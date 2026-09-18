const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { SUBCATEGORY_STATUS } = require('../config/constants');

const SubCategory = sequelize.define('SubCategory', {
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
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM(SUBCATEGORY_STATUS.ACTIVE, SUBCATEGORY_STATUS.INACTIVE),
    allowNull: false,
    defaultValue: SUBCATEGORY_STATUS.ACTIVE,
  },
}, {
  tableName: 'sub_categories',
});

module.exports = SubCategory;
