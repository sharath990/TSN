const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookingStatusHistory = sequelize.define('BookingStatusHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  old_status: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  new_status: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  changed_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'booking_status_history',
});

module.exports = BookingStatusHistory;
