const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { BOOKING_STATUS } = require('../config/constants');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  booking_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  service_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  service_area_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  booking_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  booking_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  house_flat: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  floor: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  landmark: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM(
      BOOKING_STATUS.PENDING_PAYMENT,
      BOOKING_STATUS.PENDING,
      BOOKING_STATUS.CONFIRMED,
      BOOKING_STATUS.RESCHEDULED,
      BOOKING_STATUS.COMPLETED,
      BOOKING_STATUS.CANCELLED
    ),
    allowNull: false,
    defaultValue: BOOKING_STATUS.PENDING_PAYMENT,
  },
}, {
  tableName: 'bookings',
});

module.exports = Booking;
