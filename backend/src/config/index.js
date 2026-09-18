require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.DB_NAME || 'tsn_service_booking',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  cashfree: {
    appId: process.env.CASHFREE_APP_ID || '',
    secretKey: process.env.CASHFREE_SECRET_KEY || '',
    environment: process.env.CASHFREE_ENVIRONMENT || 'sandbox',
    apiVersion: process.env.CASHFREE_API_VERSION || '2023-08-01',
    webhookUrl: process.env.CASHFREE_WEBHOOK_URL || 'http://localhost:5000/api/payments/webhook',
    returnUrl: process.env.CASHFREE_RETURN_URL || 'http://localhost:5173/payment/status/{order_id}',
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'TSN Facility Services <tsnfacilityservices@gmail.com>',
  },

  adminEmail: process.env.ADMIN_EMAIL || 'admin@tsnfacility.com',
};
