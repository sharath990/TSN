const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const rawBodyMiddleware = require('../middlewares/rawBody');
const paymentStream = require('../services/paymentStream');

const router = express.Router();

router.post(
  '/create-order',
  protect,
  authorize('customer'),
  [
    body('service_id').isInt().withMessage('Valid service is required'),
    body('booking_date').isISO8601().withMessage('Valid booking date is required'),
    body('booking_time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Valid booking time is required (HH:MM)'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('latitude').optional().isDecimal().withMessage('Valid latitude is required'),
    body('longitude').optional().isDecimal().withMessage('Valid longitude is required'),
    body('subcategory_ids').custom((value) => {
      const ids = Array.isArray(value) ? value : value ? [value] : [];
      if (ids.length === 0) throw new Error('At least one subcategory is required');
      return true;
    }),
  ],
  validate,
  paymentController.createOrder
);

router.get('/status/:orderId', protect, paymentController.getStatus);
router.get('/verify/:orderId', paymentController.verifyPayment);

router.get('/stream/:orderId', (req, res) => {
  const { orderId } = req.params;
  const token = req.query.token;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const jwt = require('jsonwebtoken');
    const config = require('../config');
    jwt.verify(token, config.jwt.secret);
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }

  paymentStream.subscribe(orderId, res);
});

router.post('/webhook', rawBodyMiddleware, paymentController.webhookHandler);

router.post(
  '/refund/:orderId',
  protect,
  authorize('admin'),
  [
    body('refund_amount').optional().isFloat({ min: 0.01 }).withMessage('Valid refund amount required'),
    body('refund_reason').optional().trim(),
  ],
  validate,
  paymentController.initiateRefund
);

module.exports = router;
