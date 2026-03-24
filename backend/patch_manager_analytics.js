const fs = require('fs');

const file = 'e:/GoogleAntigravity/inventory_management_system/backend/controllers/managerController.js';
let content = fs.readFileSync(file, 'utf8');

const newCode = `
// @desc    Dynamic Revenue Analytics for Manager Graph
// @route   GET /api/manager/analytics/revenue
const getManagerRevenueAnalytics = async (req, res) => {
  try {
    const Product = require('../models/Product');
    const MovementLog = require('../models/MovementLog');
    const shopName = req.user.shopName?.trim();
    if (!shopName) return res.status(400).json({ message: 'Shop name not found in session' });

    const { category = 'all', productName = '', filterType = 'month' } = req.query;

    let productFilter = { shopName: { $regex: new RegExp('^' + shopName + '$', 'i') } };
    
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

    const now = new Date();
    let startDate = new Date();
    let groupByFormat = "%Y-%m-%d";

    if (filterType === 'today') {
      startDate.setHours(0,0,0,0);
      groupByFormat = "%Y-%m-%d %H:00";
    } else if (filterType === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (filterType === 'month') {
      startDate.setDate(now.getDate() - 30);
    } else if (filterType === 'year') {
      startDate.setMonth(now.getMonth() - 12);
      groupByFormat = "%Y-%m";
    }

    const pipeline = [
      { 
        $match: { 
          shopName: { $regex: new RegExp('^' + shopName + '$', 'i') },
          product: { $in: prodIds },
          reason: { $regex: /sale|sold/i },
          createdAt: { $gte: startDate }
        }
      },
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'prod' } },
      { $unwind: { path: '$prod', preserveNullAndEmptyArrays: true } },
      { 
        $group: {
          _id: { $dateToString: { format: groupByFormat, date: "$createdAt", timezone: "Asia/Kolkata" } },
          revenue: { $sum: { $multiply: ['$quantityMoved', { $ifNull: ['$prod.sellingPrice', 10] }] } }
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
`;

content = content.replace('module.exports = {', newCode + '\nmodule.exports = {');
content = content.replace('getMonthlyReport };', 'getMonthlyReport, getManagerRevenueAnalytics };');
fs.writeFileSync(file, content, 'utf8');

const routeFile = 'e:/GoogleAntigravity/inventory_management_system/backend/routes/managerRoutes.js';
let routes = fs.readFileSync(routeFile, 'utf8');
routes = routes.replace('getMonthlyReport } = require', 'getMonthlyReport, getManagerRevenueAnalytics } = require');
routes = routes.replace("module.exports = router;", "\nrouter.route('/analytics/revenue')\n  .get(protect, authorize('Manager'), getManagerRevenueAnalytics);\n\nmodule.exports = router;");
fs.writeFileSync(routeFile, routes, 'utf8');

console.log('Manager Analytics Route Injected');
