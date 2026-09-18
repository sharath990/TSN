const express = require('express');
const { body } = require('express-validator');
const serviceAreaController = require('../controllers/serviceArea.controller');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/check', serviceAreaController.checkAvailability);

router.use(protect);
router.get('/', serviceAreaController.getAll);
router.get('/:id', serviceAreaController.getById);

router.post(
  '/',
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('center_lat').isDecimal().withMessage('Valid center latitude is required'),
    body('center_lng').isDecimal().withMessage('Valid center longitude is required'),
    body('radius_km').optional().isFloat({ min: 0.5, max: 100 }).withMessage('Radius must be between 0.5 and 100 km'),
  ],
  validate,
  serviceAreaController.create
);

router.put(
  '/:id',
  authorize('admin'),
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('center_lat').optional().isDecimal().withMessage('Valid center latitude is required'),
    body('center_lng').optional().isDecimal().withMessage('Valid center longitude is required'),
    body('radius_km').optional().isFloat({ min: 0.5, max: 100 }).withMessage('Radius must be between 0.5 and 100 km'),
  ],
  validate,
  serviceAreaController.update
);

router.delete('/:id', authorize('admin'), serviceAreaController.remove);

module.exports = router;
