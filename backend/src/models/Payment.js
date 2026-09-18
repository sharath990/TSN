const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { PAYMENT_STATUS } = require('../config/constants');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cf_order_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  payment_session_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'INR',
  },
  status: {
    type: DataTypes.ENUM(
      PAYMENT_STATUS.PENDING,
      PAYMENT_STATUS.PROCESSING,
      PAYMENT_STATUS.COMPLETED,
      PAYMENT_STATUS.FAILED,
      PAYMENT_STATUS.EXPIRED,
      PAYMENT_STATUS.REFUNDED,
      PAYMENT_STATUS.MANUAL_REVIEW
    ),
    allowNull: false,
    defaultValue: PAYMENT_STATUS.PENDING,
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  cf_payment_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  failure_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  refund_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  refund_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  refund_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  webhook_received_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  raw_response: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  extra_metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'payments',
  indexes: [
    { unique: true, fields: ['order_id'] },
    { fields: ['booking_id'] },
    { fields: ['customer_id'] },
    { fields: ['status'] },
    { fields: ['cf_payment_id'] },
  ],
});

module.exports = Payment;
