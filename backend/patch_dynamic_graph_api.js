const fs = require('fs');

const adminControllerPath = 'e:/GoogleAntigravity/inventory_management_system/backend/controllers/adminController.js';
let content = fs.readFileSync(adminControllerPath, 'utf8');

const newApi = `
// @desc    Dynamic Revenue Analytics for Advanced Graph
// @route   GET /api/admin/revenue-analytics
const getRevenueAnalytics = async (req, res) => {
  try {
    const Product = require('../models/Product');
    const MovementLog = require('../models/MovementLog');
    const { timeFilter = 'month', category = 'all', search = '', compare = 'false' } = req.query;

    let productFilter = {};
    if (search) {
      productFilter.name = { $regex: search, $options: 'i' };
    }
    if (category !== 'all') {
      productFilter.category = category;
    }

    let prodIds = null;
    if (search || category !== 'all') {
      const matchProds = await Product.find(productFilter).select('_id category');
      prodIds = matchProds.map(p => p._id);
    }

    const now = new Date();
    let startDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();
    let groupByFormat = "%Y-%m-%d";

    if (timeFilter === 'day') {
      startDate.setHours(now.getHours() - 24);
      prevEndDate = new Date(startDate);
      prevStartDate.setHours(prevStartDate.getHours() - 48);
      groupByFormat = "%Y-%m-%d %H:00";
    } else if (timeFilter === 'week') {
      startDate.setDate(now.getDate() - 7);
      prevEndDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 14);
    } else if (timeFilter === 'month') {
      startDate.setDate(now.getDate() - 30);
      prevEndDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 60);
    } else if (timeFilter === 'year') {
      startDate.setMonth(now.getMonth() - 12);
      prevEndDate = new Date(startDate);
      prevStartDate.setMonth(prevStartDate.getMonth() - 24);
      groupByFormat = "%Y-%m";
    }

    const buildPipeline = (start, end) => {
      let match = { 
        reason: { $regex: /sale|sold/i },
        createdAt: { $gte: start, ...(end ? { $lte: end } : {}) }
      };
      if (prodIds) match.product = { $in: prodIds };

      return [
        { $match: match },
        { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'prod' } },
        { $unwind: { path: '$prod', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'categories', localField: 'prod.category', foreignField: '_id', as: 'cat' } },
        { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
        { $group: {
            _id: {
               date: { $dateToString: { format: groupByFormat, date: "$createdAt", timezone: "Asia/Kolkata" } }, // using IST proxy
               categoryId: { $ifNull: ['$cat._id', 'none'] },
               categoryName: { $ifNull: ['$cat.name', 'Uncategorized'] }
            },
            revenue: { $sum: { $multiply: ['$quantityMoved', { $ifNull: ['$prod.sellingPrice', 10] }] } },
            orders: { $sum: 1 }
        }},
        { $sort: { "_id.date": 1 } }
      ];
    };

    const currentDataRaw = await MovementLog.aggregate(buildPipeline(startDate, now));
    
    let prevDataRaw = [];
    if (compare === 'true') {
      prevDataRaw = await MovementLog.aggregate(buildPipeline(prevStartDate, prevEndDate));
    }

    // Format Data for Recharts
    // Recharts expects array of objects: { date: '2023-01', "Clothing": 500, "Electronics": 1200, "Total": 1700 }
    const formattedDataMap = {};
    
    let totalRevenueCategoryMap = {};
    let grandTotalCurrent = 0;
    
    currentDataRaw.forEach(d => {
      const date = d._id.date;
      const cat = category === 'all' && !search ? d._id.categoryName : 'Total Revenue';
      
      if (!formattedDataMap[date]) formattedDataMap[date] = { date };
      formattedDataMap[date][cat] = (formattedDataMap[date][cat] || 0) + d.revenue;
      formattedDataMap[date].Total = (formattedDataMap[date].Total || 0) + d.revenue;
      
      grandTotalCurrent += d.revenue;
      totalRevenueCategoryMap[d._id.categoryName] = (totalRevenueCategoryMap[d._id.categoryName] || 0) + d.revenue;
    });

    if (compare === 'true') {
      // Map previous period onto current period artificially for chart comparison overlap
      const currentKeys = Object.keys(formattedDataMap).sort();
      const prevKeys = Array.from(new Set(prevDataRaw.map(d => d._id.date))).sort();
      
      // We will blindly map index to index representing "Day 1 vs Prev Day 1"
      prevKeys.forEach((prevK, i) => {
         const currentK = currentKeys[i] || \`Prev-\${i}\`;
         if (!formattedDataMap[currentK]) formattedDataMap[currentK] = { date: currentK };
         const rev = prevDataRaw.filter(d => d._id.date === prevK).reduce((a,b)=>a+b.revenue,0);
         formattedDataMap[currentK].PreviousPeriod = rev;
      });
    }

    const finalChartData = Object.values(formattedDataMap).sort((a,b) => a.date.localeCompare(b.date));

    // Dynamic AI Insight Generator
    let insight = "Sales holding steady.";
    if (grandTotalCurrent > 0) {
       const topCat = Object.keys(totalRevenueCategoryMap).reduce((a, b) => totalRevenueCategoryMap[a] > totalRevenueCategoryMap[b] ? a : b, "");
       if (compare === 'true') {
          const grandTotalPrev = prevDataRaw.reduce((a,b) => a+b.revenue, 0);
          if (grandTotalPrev > 0) {
             const growth = (((grandTotalCurrent - grandTotalPrev) / grandTotalPrev) * 100).toFixed(1);
             if (growth > 0) insight = \`Sales increased by \${growth}% this \${timeFilter}, driven largely by the \${topCat} category.\`;
             else insight = \`Sales dropped \${Math.abs(growth)}% this \${timeFilter}. Focus marketing on \${topCat} to recover.\`;
          } else {
             insight = \`Massive momentum! No sales recorded previous \${timeFilter}, \${topCat} is leading current growth.\`;
          }
       } else {
          insight = \`Revenue generated successfully this \${timeFilter}, with \${topCat} driving maximum performance.\`;
       }
    } else {
       insight = \`No data found for this selection. Try adjusting the category or time parameters.\`;
    }

    res.json({
       chartData: finalChartData,
       insight,
       categoriesPresent: Object.keys(totalRevenueCategoryMap),
       peakSales: finalChartData.length ? Math.max(...finalChartData.map(d => d.Total || 0)) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
`;

content = content.replace('module.exports = {', newApi + '\nmodule.exports = {');
content = content.replace('getAdvancedAnalytics\n};', 'getAdvancedAnalytics, getRevenueAnalytics\n};');

fs.writeFileSync(adminControllerPath, content, 'utf8');

const adminRoutesPath = 'e:/GoogleAntigravity/inventory_management_system/backend/routes/adminRoutes.js';
let routes = fs.readFileSync(adminRoutesPath, 'utf8');
routes = routes.replace('getAdvancedAnalytics\n} = require(', 'getAdvancedAnalytics, getRevenueAnalytics\n} = require(');
routes = routes.replace("router.get('/advanced-analytics', ...adm, getAdvancedAnalytics);", "router.get('/advanced-analytics', ...adm, getAdvancedAnalytics);\nrouter.get('/analytics/revenue', ...adm, getRevenueAnalytics);");
fs.writeFileSync(adminRoutesPath, routes, 'utf8');

console.log('Backend Dynamic Graph API injected successfully!');
