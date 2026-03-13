const express = require('express');
const router = express.Router();
const { addProduct, getProducts, updateProductStatus, updateProductQuantity } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('Staff', 'Manager', 'Admin'), addProduct)
  .get(protect, getProducts);

router.route('/:id/status')
  .put(protect, authorize('Manager'), updateProductStatus);

router.route('/:id/quantity')
  .put(protect, authorize('Staff', 'Manager'), updateProductQuantity);

module.exports = router;
