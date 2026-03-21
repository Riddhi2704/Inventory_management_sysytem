const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');

// @desc    Get all purchase orders for a shop
// @route   GET /api/purchase-orders
// @access  Private (Manager)
const getPurchaseOrders = async (req, res) => {
  try {
    const shopName = req.user.shopName;
    const safeShopName = shopName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const shopFilter = { shopName: { $regex: new RegExp(`^${safeShopName}$`, 'i') } };
    const orders = await PurchaseOrder.find(shopFilter)
      .populate('supplier', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new purchase order
// @route   POST /api/purchase-orders
// @access  Private (Manager)
const createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, productName, quantity, price } = req.body;
    const shopName = req.user.shopName;
    const createdBy = req.user.id;

    // Generate a unique Order ID (PO-XXXXX)
    const orderId = `PO-${Math.floor(10000 + Math.random() * 90000)}`;

    const totalAmount = quantity * price;

    const newOrder = await PurchaseOrder.create({
      orderId,
      supplier,
      items: [{ productName, quantity, price }],
      totalAmount,
      status: 'Pending',
      shopName,
      createdBy
    });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPurchaseOrders,
  createPurchaseOrder
};
