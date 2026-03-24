const mongoose = require('mongoose');
const MovementLog = require('./models/MovementLog');
const Product = require('./models/Product');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
  const logs = await MovementLog.find();
  const products = await Product.find();

  const timeFilter = 'Monthly';
  const trendMap = {};
  const today = new Date();

  for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      trendMap[dateKey] = { revenue: 0, orders: 0 };
  }

  logs.forEach(log => {
      const logDate = new Date(log.createdAt);
      const dateKey = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (trendMap[dateKey]) {
          if (!['Restock', 'Found', 'Return'].includes(log.reason)) {
              trendMap[dateKey].orders += log.quantityMoved;
              
              const pId = log.product?._id || log.product || log.productId;
              const relProduct = products.find(p => String(p._id) === String(pId));
              const price = relProduct ? (relProduct.sellingPrice || relProduct.purchasePrice || 10) : 10;
              
              trendMap[dateKey].revenue += log.quantityMoved * price;
          }
      }
  });

  console.log("Monthly trend map:", trendMap);
  const totalRev = Object.values(trendMap).reduce((s, i) => s + i.revenue, 0);
  console.log("Total Monthly Revenue:", totalRev);

  process.exit(0);
}

check();
