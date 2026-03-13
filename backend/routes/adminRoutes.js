const express = require('express');
const router = express.Router();
const { getAdminDashboardStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.route('/dashboard')
  .get(protect, authorize('Admin'), getAdminDashboardStats);

module.exports = router;
