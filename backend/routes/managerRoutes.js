const express = require('express');
const router = express.Router();
const { getManagerDashboardStats } = require('../controllers/managerController');
const { protect, authorize } = require('../middleware/auth');

router.route('/dashboard')
  .get(protect, authorize('Manager'), getManagerDashboardStats);

module.exports = router;
