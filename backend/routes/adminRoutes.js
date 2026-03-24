const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats, getAllUsers, createUser, updateUser, deleteUser,
  getAllProducts, getShopAnalytics, getMovementReport, getCategoryAnalysis,
  getTotalStaff, getTotalManagers, getTotalOrganizations, getAdvancedAnalytics, getRevenueAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const adm = [protect, authorize('Admin')];

router.get('/dashboard', ...adm, getAdminDashboardStats);
router.get('/products', ...adm, getAllProducts);
router.get('/shops', ...adm, getShopAnalytics);
router.get('/movements', ...adm, getMovementReport);
router.get('/categories/analysis', ...adm, getCategoryAnalysis);

router.get('/total-staff', ...adm, getTotalStaff);
router.get('/total-managers', ...adm, getTotalManagers);
router.get('/total-organizations', ...adm, getTotalOrganizations);
router.get('/advanced-analytics', ...adm, getAdvancedAnalytics);
router.get('/analytics/revenue', ...adm, getRevenueAnalytics);

router.route('/users')
  .get(...adm, getAllUsers)
  .post(...adm, createUser);

router.route('/users/:id')
  .put(...adm, updateUser)
  .delete(...adm, deleteUser);

module.exports = router;