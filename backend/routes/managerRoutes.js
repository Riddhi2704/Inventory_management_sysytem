const express = require('express');
const router = express.Router();
const { getManagerDashboardStats, getDailyReport, getMonthlyReport, getManagerRevenueAnalytics } = require('../controllers/managerController');
const { protect, authorize } = require('../middleware/auth');

router.route('/dashboard')
  .get(protect, authorize('Manager'), getManagerDashboardStats);

router.route('/reports/daily')
  .get(protect, authorize('Manager'), getDailyReport);

router.route('/reports/monthly')
  .get(protect, authorize('Manager'), getMonthlyReport);


router.route('/analytics/revenue')
  .get(protect, authorize('Manager'), getManagerRevenueAnalytics);

module.exports = router;
