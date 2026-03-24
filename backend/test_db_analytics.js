const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
  console.log('Connected');

  const Product = require('./models/Product');
  const MovementLog = require('./models/MovementLog');

  try {
    // 1. Category Performance
    const categoryPerformance = await Product.aggregate([
      { $match: { status: 'Active' } },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'cat' } },
      { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
      { $group: {
          _id: { $ifNull: ['$cat.name', 'Uncategorized'] },
          quantity: { $sum: '$quantity' },
          value: { $sum: { $multiply: ['$sellingPrice', '$quantity'] } }
        }
      },
      { $sort: { value: -1 } },
      { $limit: 10 }
    ]);
    console.log("1 pass");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // 2. Sales Analytics
    const salesAgg = await MovementLog.aggregate([
      { $match: { reason: { $regex: /sale|sold/i }, createdAt: { $gte: thirtyDaysAgo } } },
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'prod' } },
      { $unwind: { path: '$prod', preserveNullAndEmptyArrays: true } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: '$quantityMoved' },
          revenue: { $sum: { $multiply: ['$quantityMoved', { $ifNull: ['$prod.sellingPrice', 10] }] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    console.log("2 pass");

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
    console.log("3 pass", movementAgg);

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
    console.log("4 pass");

    // 5. Supplier Stats
    const supplierStats = await Product.aggregate([
      { $lookup: { from: 'suppliers', localField: 'supplier', foreignField: '_id', as: 'sup' } },
      { $unwind: { path: '$sup', preserveNullAndEmptyArrays: true } },
      { $group: {
          _id: { $ifNull: ['$sup.name', 'Unknown'] },
          totalProducts: { $sum: 1 },
          inventoryValue: { $sum: { $multiply: ['$sellingPrice', '$quantity'] } }
        }
      },
      { $sort: { inventoryValue: -1 } },
      { $limit: 5 }
    ]);
    console.log("5 pass");

  } catch (error) {
     console.error(error);
  }
  process.exit(0);
}
test();
