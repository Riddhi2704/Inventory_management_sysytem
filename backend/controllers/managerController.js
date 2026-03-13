const Product = require('../models/Product');
const MovementLog = require('../models/MovementLog');

// @desc    Get Manager Dashboard Stats
// @route   GET /api/manager/dashboard
// @access  Private (Manager)
const getManagerDashboardStats = async (req, res) => {
  try {
    // Example: get recent products pending approval
    const pendingProducts = await Product.find({ status: 'Pending Approval' }).countDocuments();
    
    // Inventory Value
    const products = await Product.find();
    let inventoryValue = 0;
    products.forEach(p => {
      inventoryValue += (p.sellingPrice * p.quantity);
    });

    // Recent movements
    const recentMovements = await MovementLog.find().sort({ createdAt: -1 }).limit(10).populate('product', 'name');

    res.json({
      pendingProducts,
      inventoryValue,
      recentMovements
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getManagerDashboardStats };
