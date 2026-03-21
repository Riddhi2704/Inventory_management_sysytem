const Product = require('../models/Product');
const MovementLog = require('../models/MovementLog');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');

// @desc    Get Manager Dashboard Stats
// @route   GET /api/manager/dashboard
// @access  Private (Manager)
const getManagerDashboardStats = async (req, res) => {
  try {
    const shopName = req.user.shopName?.trim();
    if (!shopName) {
      return res.status(400).json({ message: 'Shop name not found in session' });
    }
    
    console.log(`Debug Dashboard: Fetching stats for [${shopName}]`);
    
    // Using regex for robust matching against spacing/case issues

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // shopFilter: matches products belonging to this shop (case-insensitive, trims whitespace)
    const shopFilter = { shopName: { $regex: shopName, $options: 'i' } };

    // 1. Summary Cards
    const totalProducts = await Product.countDocuments(shopFilter);
    const outOfStock = await Product.countDocuments({ ...shopFilter, quantity: 0 });
    const pendingApproval = await Product.countDocuments({ ...shopFilter, status: 'Pending Approval' });
    const lowStock = await Product.countDocuments({ ...shopFilter, quantity: { $gt: 0, $lt: 5 } });
    
    const products = await Product.find({ ...shopFilter, status: 'Active' });
    let totalInventoryValue = 0;
    let totalPurchaseValue = 0;
    let totalSellingValue = 0;
    
    products.forEach(p => {
      totalInventoryValue += (p.sellingPrice * p.quantity);
      totalPurchaseValue += (p.purchasePrice * p.quantity);
      totalSellingValue += (p.sellingPrice * p.quantity);
    });

    // 2. Low Stock Details
    const lowStockProducts = await Product.find({ 
      ...shopFilter, 
      quantity: { $lt: 5 } 
    }).select('name quantity').limit(5);

    // 3. Category Distribution
    const categoryStats = await Product.aggregate([
      { $match: shopFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryInfo' } },
      { $unwind: '$categoryInfo' },
      { $project: { name: '$categoryInfo.name', count: 1 } }
    ]);

    // 4. Sales & Profit Analytics (from MovementLog)
    const movements = await MovementLog.find({ 
      ...shopFilter,
      createdAt: { $gte: thirtyDaysAgo }
    }).populate('product');

    let totalProfit = 0;
    const salesData = {}; // By date
    const productSales = {}; // By product
    const movementTrends = {}; // By date { added: 0, removed: 0 }

    movements.forEach(m => {
      const date = m.createdAt.toISOString().split('T')[0];
      if (!m.product) return;

      const isSale = ['Sale', 'Sent Out'].includes(m.reason);
      const isRestock = ['Restock', 'Return', 'Found'].includes(m.reason);

      if (isSale) {
        const rev = m.quantityMoved * m.product.sellingPrice;
        const cost = m.quantityMoved * m.product.purchasePrice;
        totalProfit += (rev - cost);
        
        salesData[date] = (salesData[date] || 0) + rev;
        
        if (!productSales[m.product.name]) {
          productSales[m.product.name] = { totalSold: 0, revenue: 0 };
        }
        productSales[m.product.name].totalSold += m.quantityMoved;
        productSales[m.product.name].revenue += rev;
      }

      if (!movementTrends[date]) movementTrends[date] = { added: 0, removed: 0 };
      if (isRestock) movementTrends[date].added += m.quantityMoved;
      else movementTrends[date].removed += m.quantityMoved;
    });

    // Format for charts
    const topSellingProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    const salesAnalytics = Object.entries(salesData)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const inventoryMovementData = Object.entries(movementTrends)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 5. Supplier Contribution
    const supplierStats = await Product.aggregate([
      { $match: shopFilter },
      { $group: { _id: '$supplier', count: { $sum: 1 } } },
      { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 'supplierInfo' } },
      { $unwind: '$supplierInfo' },
      { $project: { name: '$supplierInfo.name', count: 1 } }
    ]);

    // Fast vs Slow Moving
    const fastMoving = topSellingProducts.slice(0, 3);
    const slowMoving = await Product.find(shopFilter)
      .sort({ quantity: -1 }) // Simple logic for slow moving: high stock, low movement
      .limit(3)
      .select('name');

    // Recent movements for table
    const recentMovements = await MovementLog.find(shopFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: 'product',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'supplier', select: 'name' }
        ]
      })
      .lean();

    console.log(`Debug Dashboard: Summary complete for [${shopName}]. Total Value: ${totalInventoryValue}`);

    res.json({
      summary: {
        totalProducts,
        outOfStock,
        pendingApproval,
        totalInventoryValue,
        lowStock
      },
      lowStockProducts,
      topSellingProducts,
      categoryDistribution: categoryStats,
      salesAnalytics,
      profitAnalysis: {
        totalPurchaseValue,
        totalSellingValue,
        totalProfit: totalSellingValue - totalPurchaseValue
      },
      movementTrends: inventoryMovementData,
      supplierContribution: supplierStats,
      fastMoving,
      slowMoving,
      recentMovements
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDailyReport = async (req, res) => {
  try {
    const shopName = req.user.shopName?.trim();
    if (!shopName) return res.status(400).json({ message: 'Shop name not found' });
    const shopFilter = { shopName: { $regex: shopName, $options: 'i' } };

    const today = new Date();
    today.setHours(0,0,0,0);

    const productsAdded = await Product.find({ 
      ...shopFilter, 
      createdAt: { $gte: today } 
    }).countDocuments();

    const movements = await MovementLog.find({
      ...shopFilter,
      createdAt: { $gte: today }
    });

    const productsRemoved = movements.filter(m => 
      ['Damage', 'Sent Out', 'Used', 'Sale'].includes(m.reason)
    ).length;

    // This would ideally count PurchaseOrder records
    // const ordersCreated = await PurchaseOrder.find({ ...shopFilter, createdAt: { $gte: today } }).countDocuments();

    res.json({
      date: today,
      productsAdded,
      productsRemoved,
      ordersCreated: 0 // Placeholder until PO system is fully integrated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const shopName = req.user.shopName?.trim();
    if (!shopName) return res.status(400).json({ message: 'Shop name not found' });
    const shopFilter = { shopName: { $regex: shopName, $options: 'i' } };

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const movements = await MovementLog.find({
      ...shopFilter,
      createdAt: { $gte: startOfMonth }
    });

    let stockIn = 0;
    let stockOut = 0;
    movements.forEach(m => {
      if (['Restock', 'Return', 'Found'].includes(m.reason)) stockIn += m.quantityMoved;
      else stockOut += m.quantityMoved;
    });

    const products = await Product.find(shopFilter);
    let totalValue = 0;
    products.forEach(p => totalValue += (p.sellingPrice * p.quantity));

    res.json({
      month: startOfMonth.toLocaleString('default', { month: 'long' }),
      stockMovement: { in: stockIn, out: stockOut },
      inventoryValue: totalValue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getManagerDashboardStats, getDailyReport, getMonthlyReport };
