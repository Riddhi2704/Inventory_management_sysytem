const Product = require('../models/Product');
const MovementLog = require('../models/MovementLog');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');

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
    const totalProducts = await Product.countDocuments({ ...shopFilter, status: 'Active' });
    const outOfStock = await Product.countDocuments({ ...shopFilter, quantity: 0 });
    const pendingApproval = await Product.countDocuments({ ...shopFilter, status: 'Pending Approval' });
    const lowStock = await Product.countDocuments({ 
      ...shopFilter, 
      status: 'Active',
      quantity: { $gt: 0 },
      $expr: { $lte: ["$quantity", "$minStockLevel"] }
    });
    
    // 3. Category Distribution
    const categoryStats = await Product.aggregate([
      { $match: shopFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryInfo' } },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      { $project: { name: '$categoryInfo.name', count: 1 } }
    ]);

    // New Metrics for Updated Dashboard (Strictly filtered to Manager's own shop)
    const totalCategories = categoryStats.length;
    const totalSuppliers = await Supplier.countDocuments(shopFilter);
    const totalOrders = await PurchaseOrder.countDocuments(shopFilter).catch(() => 0);
    
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
      status: 'Active',
      quantity: { $gt: 0 },
      $expr: { $lte: ["$quantity", "$minStockLevel"] }
    }).select('name quantity minStockLevel').limit(5);

    // 4. Sales & Profit Analytics (from MovementLog)
    // Use relative time boundaries (last 24h and last 30d) to avoid timezone-related 0 values
    const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const queryStartDate = new Date(Math.min(thirtyDaysAgo.getTime(), startOfMonth.getTime()));

    const movements = await MovementLog.find({ 
      ...shopFilter,
      createdAt: { $gte: queryStartDate }
    }).populate('product');

    let totalProfit = 0;
    const salesData = {}; // By date
    const productSales = {}; // By product
    let todaySales = 0;
    let monthlyRevenue = 0;
    const movementTrends = {}; // By date { added: 0, removed: 0 }

    movements.forEach(m => {
      const date = m.createdAt.toISOString().split('T')[0];
      if (!m.product) return;

      const isSale = /sale|sold|sent out/i.test(m.reason);
      const isRestock = /restock|return|found|received/i.test(m.reason);

      if (isSale) {
        const rev = m.quantityMoved * m.product.sellingPrice;
        const cost = m.quantityMoved * m.product.purchasePrice;
        totalProfit += (rev - cost);
        
        if (m.createdAt >= startOfDay) todaySales += rev;
        if (m.createdAt >= startOfMonth) monthlyRevenue += rev;
        
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
    
    // Improved Slow Moving logic:
    // 1. Identify products with NO sales in the 30-day window
    // 2. Sort by highest stock level among those with no sales
    // 3. Supplement with lowest selling items if needed
    const soldProductNames = Object.keys(productSales);
    let slowMoving = products
      .filter(p => !soldProductNames.includes(p.name))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3)
      .map(p => ({ name: p.name, quantity: p.quantity }));

    if (slowMoving.length < 3) {
      const additionalSlow = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => a.totalSold - b.totalSold);
      
      for (const item of additionalSlow) {
        if (slowMoving.length >= 3) break;
        if (!slowMoving.find(s => s.name === item.name)) {
          const prod = products.find(p => p.name === item.name);
          slowMoving.push({ 
            name: item.name, 
            quantity: prod ? prod.quantity : 0 
          });
        }
      }
    }

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
        lowStock,
        totalCategories,
        totalSuppliers,
        totalOrders,
        todaySales,
        monthlyRevenue
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


// @desc    Dynamic Revenue Analytics for Manager Graph
// @route   GET /api/manager/analytics/revenue
const getManagerRevenueAnalytics = async (req, res) => {
  try {
    const Product = require('../models/Product');
    const MovementLog = require('../models/MovementLog');
    const shopName = req.user.shopName?.trim();
    if (!shopName) return res.status(400).json({ message: 'Shop name not found in session' });

    const { category = 'all', productName = '', filterType = 'month' } = req.query;

    let productFilter = { shopName: { $regex: shopName, $options: 'i' } };
    
    if (productName) {
      productFilter.name = { $regex: productName, $options: 'i' };
    }
    
    let categoryObjId = null;
    if (category !== 'all') {
       // if category is an ID or Name. Usually it might be an ObjectId, but let's just lookup by name or ID.
       const Category = require('../models/Category');
       const catDoc = await Category.findOne({ $or: [{ _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }, { name: category }] });
       if (catDoc) productFilter.category = catDoc._id;
    }

    const matchProds = await Product.find(productFilter).select('_id');
    const prodIds = matchProds.map(p => p._id);

    const baseMatch = {
      shopName: { $regex: shopName, $options: 'i' },
      reason: { $regex: /sale|sold|sent out/i }
    };

    if (category !== 'all' || productName !== '') {
      baseMatch.product = { $in: prodIds };
    }

    const now = new Date();
    let startDate = new Date();
    let groupByFormat = "%Y-%m-%d";

    if (filterType === 'today') {
      startDate.setHours(0,0,0,0);
      groupByFormat = "%Y-%m-%d %H:00";
    } else if (filterType === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (filterType === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (filterType === 'year') {
      startDate.setMonth(now.getMonth() - 12);
      groupByFormat = "%Y-%m";
    }

    baseMatch.createdAt = { $gte: startDate };

    const pipeline = [
      { 
        $match: baseMatch
      },
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'prod' } },
      { $unwind: { path: '$prod', preserveNullAndEmptyArrays: true } },
      { 
        $group: {
          _id: { $dateToString: { format: groupByFormat, date: "$createdAt", timezone: "Asia/Kolkata" } },
          revenue: { $sum: { $multiply: ['$quantityMoved', { $ifNull: ['$prod.sellingPrice', 0] }] } }
        }
      },
      { $sort: { "_id": 1 } },
      { $project: { _id: 0, date: "$_id", revenue: 1 } }
    ];

    const data = await MovementLog.aggregate(pipeline);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getManagerDashboardStats, getDailyReport, getMonthlyReport, getManagerRevenueAnalytics };
