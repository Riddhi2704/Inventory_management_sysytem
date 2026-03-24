require('mongoose').connect('mongodb://localhost:27017/inventory_system').then(async () => {
  const MovementLog = require('./models/MovementLog');
  const Product = require('./models/Product');
  const shopName = 'Shriji kirayana store'; // Assuming this is the shop
  const now = new Date();
  let startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const pipeline = [
      { 
        $match: {
          shopName: { $regex: shopName, $options: 'i' },
          reason: { $regex: /sale|sold|sent out/i },
          createdAt: { $gte: startDate }
        }
      },
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'prod' } },
      { $unwind: { path: '$prod', preserveNullAndEmptyArrays: true } },
      { 
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } },
          revenue: { $sum: { $multiply: ['$quantityMoved', { $ifNull: ['$prod.sellingPrice', 0] }] } }
        }
      },
      { $sort: { "_id": 1 } },
      { $project: { _id: 0, date: "$_id", revenue: 1 } }
    ];

  const data = await MovementLog.aggregate(pipeline);
  console.log("Graph Data:", data);
  process.exit(0);
});
