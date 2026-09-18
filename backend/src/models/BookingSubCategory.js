const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookingSubCategory = sequelize.define('BookingSubCategory', {
  booking_id: {
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
  tableName: 'booking_subcategories',
  timestamps: false,
});

module.exports = BookingSubCategory;
