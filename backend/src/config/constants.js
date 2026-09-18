module.exports = {
  ROLES: {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
  },

  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    RESCHEDULED: 'rescheduled',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },

  USER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },

  SERVICE_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },

  CATEGORY_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },

  SUBCATEGORY_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },

  PAYMENT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    EXPIRED: 'expired',
    REFUNDED: 'refunded',
    MANUAL_REVIEW: 'manual_review',
  },

  PAYMENT_METHODS: {
    UPI: 'upi',
    CARD: 'card',
    NET_BANKING: 'net_banking',
    WALLET: 'wallet',
    EMI: 'emi',
    PAY_LATER: 'pay_later',
  },

  BOOKING_STATUS: {
    PENDING_PAYMENT: 'pending_payment',
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    RESCHEDULED: 'rescheduled',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
};
