const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats, getAllUsers, createUser, updateUser, deleteUser,
  getAllProducts, getShopAnalytics, getMovementReport, getCategoryAnalysis
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const adm = [protect, authorize('Admin')];

router.get('/dashboard', ...adm, getAdminDashboardStats);
router.get('/products', ...adm, getAllProducts);
router.get('/shops', ...adm, getShopAnalytics);
router.get('/movements', ...adm, getMovementReport);
router.get('/categories/analysis', ...adm, getCategoryAnalysis);

router.route('/users')
  .get(...adm, getAllUsers)
  .post(...adm, createUser);

router.route('/users/:id')
  .put(...adm, updateUser)
  .delete(...adm, deleteUser);

module.exports = router;