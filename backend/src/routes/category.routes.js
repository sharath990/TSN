const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/category.controller');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const categoryUpload = require('../middlewares/uploadCategory');

const router = express.Router();

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

router.post(
  '/',
  protect,
  authorize('admin'),
  categoryUpload.single('image'),
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
  ],
  validate,
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Category image is required' });
    }
    next();
  },
  categoryController.create
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  categoryUpload.single('image'),
  [body('name').optional().trim().notEmpty()],
  validate,
  categoryController.update
);

router.delete('/:id', protect, authorize('admin'), categoryController.remove);

module.exports = router;
