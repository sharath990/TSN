const express = require('express');
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), adminController.getDashboard);

module.exports = router;
