const express = require('express');
const router = express.Router();
const { addProduct, getProducts, updateProduct, deleteProduct, updateProductStatus, updateProductQuantity, getProductStats } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, getProductStats);

router.route('/')
  .post(protect, authorize('Staff', 'Manager', 'Admin'), addProduct)
  .get(protect, getProducts);

router.route('/:id')
  .put(protect, authorize('Staff', 'Manager', 'Admin'), updateProduct)
  .delete(protect, authorize('Staff', 'Manager', 'Admin'), deleteProduct);

router.route('/:id/status')
  .put(protect, authorize('Manager'), updateProductStatus);

router.route('/:id/quantity')
  .put(protect, authorize('Staff', 'Manager'), updateProductQuantity);

module.exports = router;
