require('mongoose').connect('mongodb://localhost:27017/inventory_system').then(async () => {
  const MovementLog = require('./models/MovementLog');
  const Product = require('./models/Product');
  const shopName = 'Shriji kirayana store'; // Assuming this is the shop
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const shopFilter = { shopName: { $regex: shopName, $options: 'i' } };

  const m1 = await MovementLog.find({ 
    ...shopFilter, 
    createdAt: { $gte: thirtyDaysAgo } 
  }).populate('product');

  let scard = 0;
  console.log("--- CARD LOGS ---");
  m1.forEach(m => {
    if (!m.product) return;
    const isSale = /sale|sold|sent out/i.test(m.reason);
    if (isSale) {
      const rev = m.quantityMoved * (m.product.sellingPrice || 0);
      scard += rev;
      console.log(`Log ${m._id}: qty=${m.quantityMoved}, price=${m.product.sellingPrice || 0}, rev=${rev}, reason=${m.reason}`);
    }
  });
  console.log('Card Output:', scard);

  console.log("--- GRAPH LOGS ---");
  const baseMatch = {
    shopName: { $regex: shopName, $options: 'i' },
    reason: { $regex: /sale|sold|sent out/i },
    createdAt: { $gte: thirtyDaysAgo }
  };

  const m2 = await MovementLog.aggregate([
    { $match: baseMatch },
    { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'prod' } },
    { $unwind: { path: '$prod', preserveNullAndEmptyArrays: true } },
    { $group: { 
        _id: '$_id', 
        rev: { $sum: { $multiply: ['$quantityMoved', { $ifNull: ['$prod.sellingPrice', 0] }] } },
        reason: { $first: '$reason' }
      } 
    }
  ]);

  let sgraph = 0;
  m2.forEach(m => {
    sgraph += m.rev;
    console.log(`Log ${m._id}: rev=${m.rev}, reason=${m.reason}`);
  });
  console.log('Graph Output:', sgraph);

  process.exit(0);
});
