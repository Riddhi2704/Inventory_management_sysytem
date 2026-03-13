const express = require('express');
const router = express.Router();
const { getSuppliers, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getSuppliers)
  .post(protect, authorize('Manager', 'Admin'), createSupplier);

router.route('/:id')
  .put(protect, authorize('Manager', 'Admin'), updateSupplier)
  .delete(protect, authorize('Manager', 'Admin'), deleteSupplier);

module.exports = router;
