const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalSuppliers = await Supplier.countDocuments();
    
    const lowStockProducts = await Product.find({ $expr: { $lte: ['$quantity', '$minStockLevel'] } }).countDocuments();
    const outOfStockProducts = await Product.find({ quantity: 0 }).countDocuments();
    
    // Total Inventory Value
    const products = await Product.find();
    let totalInventoryValue = 0;
    products.forEach(p => {
      totalInventoryValue += (p.sellingPrice * p.quantity);
    });

    res.json({
      totalProducts,
      totalCategories,
      totalSuppliers,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminDashboardStats };
