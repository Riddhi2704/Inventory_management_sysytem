const fs = require('fs');

const adminControllerPath = 'e:/GoogleAntigravity/inventory_management_system/backend/controllers/adminController.js';
let content = fs.readFileSync(adminControllerPath, 'utf8');

const newCode = `
// @desc    Advanced Analytics
// @route   GET /api/admin/advanced-analytics
const getAdvancedAnalytics = async (req, res) => {
  try {
    const Product = require('../models/Product');
    const MovementLog = require('../models/MovementLog');
    
    // 1. Category Performance
    const categoryPerformance = await Product.aggregate([
      { $match: { status: 'Active' } },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'cat' } },
      { $unwind: { path: '$cat', preserveNullAndEmpty: true } },
      { $group: {
          _id: { $ifNull: ['$cat.name', 'Uncategorized'] },
          quantity: { $sum: '$quantity' },
          value: { $sum: { $multiply: ['$sellingPrice', '$quantity'] } }
        }
      },
      { $sort: { value: -1 } },
      { $limit: 10 }
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // 2. Sales Analytics
    const salesAgg = await MovementLog.aggregate([
      { $match: { reason: { $regex: /sale|sold/i }, createdAt: { $gte: thirtyDaysAgo } } },
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'prod' } },
      { $unwind: { path: '$prod', preserveNullAndEmpty: true } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: '$quantityMoved' },
          revenue: { $sum: { $multiply: ['$quantityMoved', { $ifNull: ['$prod.sellingPrice', 10] }] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. Inventory Movement
    const movementAgg = await MovementLog.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sold: { $sum: { $cond: [{ $regexMatch: { input: "$reason", regex: /sale|sold/i } }, "$quantityMoved", 0] } },
          restocked: { $sum: { $cond: [{ $regexMatch: { input: "$reason", regex: /restock|return|found/i } }, "$quantityMoved", 0] } },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 4. Profit Analysis
    const profitAnalysis = await Product.aggregate([
      { $match: { status: 'Active', purchasePrice: { $gt: 0 } } },
      { $project: {
          name: 1,
          cost: '$purchasePrice',
          sellingPrice: 1,
          profitMargin: { $subtract: ['$sellingPrice', '$purchasePrice'] }
        }
      },
      { $sort: { profitMargin: -1 } },
      { $limit: 10 }
    ]);

    // 5. Supplier Stats
    const supplierStats = await Product.aggregate([
      { $lookup: { from: 'suppliers', localField: 'supplier', foreignField: '_id', as: 'sup' } },
      { $unwind: { path: '$sup', preserveNullAndEmpty: true } },
      { $group: {
          _id: { $ifNull: ['$sup.name', 'Unknown'] },
          totalProducts: { $sum: 1 },
          inventoryValue: { $sum: { $multiply: ['$sellingPrice', '$quantity'] } }
        }
      },
      { $sort: { inventoryValue: -1 } },
      { $limit: 5 }
    ]);

    const outOfStockCount = await Product.countDocuments({ quantity: 0 });
    const totalProducts = await Product.countDocuments({ status: { $ne: 'Rejected' } });
    const stockHealth = totalProducts > 0 ? ((totalProducts - outOfStockCount) / totalProducts) * 100 : 100;
    const healthScore = Math.floor(stockHealth * 0.8 + 20);

    const predictiveForecast = salesAgg.map(s => ({
       date: s._id,
       predictedSales: Math.floor(s.revenue * 1.05)
    }));

    res.json({
       categoryPerformance,
       salesAnalytics: salesAgg,
       inventoryMovement: movementAgg,
       profitAnalysis,
       supplierStats,
       forecastData: predictiveForecast,
       healthScore,
       topCategory: categoryPerformance[0]?._id || 'N/A',
       avgOrderValue: salesAgg.length > 0 ? Math.floor(salesAgg.reduce((a,b)=>a+b.revenue,0) / Math.max(1, salesAgg.reduce((a,b)=>a+b.orders,0))) : 0,
       totalRevenue: salesAgg.reduce((a,b)=>a+b.revenue,0),
       totalOrders: salesAgg.reduce((a,b)=>a+b.orders,0)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
`;

content = content.replace('module.exports = {', newCode + '\nmodule.exports = {');
content = content.replace('getTotalOrganizations', 'getTotalOrganizations, getAdvancedAnalytics');

fs.writeFileSync(adminControllerPath, content, 'utf8');

const adminRoutesPath = 'e:/GoogleAntigravity/inventory_management_system/backend/routes/adminRoutes.js';
let routes = fs.readFileSync(adminRoutesPath, 'utf8');
routes = routes.replace('getTotalOrganizations', 'getTotalOrganizations, getAdvancedAnalytics');
routes = routes.replace("router.get('/total-organizations', ...adm, getTotalOrganizations);", "router.get('/total-organizations', ...adm, getTotalOrganizations);\nrouter.get('/advanced-analytics', ...adm, getAdvancedAnalytics);");
fs.writeFileSync(adminRoutesPath, routes, 'utf8');

console.log('Backend APIs constructed successfully!');
