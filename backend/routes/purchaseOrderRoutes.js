const express = require('express');
const router = express.Router();
const { getPurchaseOrders, createPurchaseOrder } = require('../controllers/purchaseOrderController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('Manager'), getPurchaseOrders)
  .post(protect, authorize('Manager'), createPurchaseOrder);

module.exports = router;
