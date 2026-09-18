const express = require('express');
const { body } = require('express-validator');
const subcategoryController = require('../controllers/subcategory.controller');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', subcategoryController.getAll);
router.get('/:id', subcategoryController.getById);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Subcategory name is required'),
    body('category_id').isInt().withMessage('Valid category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  ],
  validate,
  subcategoryController.create
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  [
    body('name').optional().trim().notEmpty(),
    body('category_id').optional().isInt(),
    body('price').optional().isFloat({ min: 0 }),
  ],
  validate,
  subcategoryController.update
);

router.delete('/:id', protect, authorize('admin'), subcategoryController.remove);

module.exports = router;
