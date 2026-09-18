const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protect, bookingController.getAll);
router.get('/:id', protect, bookingController.getById);

router.patch(
  '/:id/status',
  protect,
  authorize('admin'),
  bookingController.updateStatus
);

router.patch(
  '/:id/cancel',
  protect,
  bookingController.cancel
);

module.exports = router;
