const express = require('express');
const { body } = require('express-validator');
const serviceController = require('../controllers/service.controller');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');

const router = express.Router();

router.get('/', serviceController.getAll);
router.get('/:id', serviceController.getById);

router.post(
  '/',
  protect,
  authorize('admin'),
  upload.single('image'),
  [
    body('name').trim().notEmpty().withMessage('Service name is required'),
    body('category_id').isInt().withMessage('Valid category is required'),
    body('duration').isInt({ min: 15 }).withMessage('Duration must be at least 15 minutes'),
  ],
  validate,
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Service image is required' });
    }
    next();
  },
  serviceController.create
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.single('image'),
  [
    body('name').optional().trim().notEmpty(),
    body('duration').optional().isInt({ min: 15 }),
  ],
  validate,
  serviceController.update
);

router.delete('/:id', protect, authorize('admin'), serviceController.remove);

module.exports = router;
