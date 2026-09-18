const express = require('express');
const customerController = require('../controllers/customer.controller');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), customerController.getAll);
router.get('/stats', protect, authorize('admin'), customerController.getStats);
router.get('/:id', protect, authorize('admin'), customerController.getById);
router.patch(
  '/:id/status',
  protect,
  authorize('admin'),
  customerController.updateStatus
);

module.exports = router;
