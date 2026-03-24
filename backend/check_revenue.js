const mongoose = require('mongoose');
const MovementLog = require('./models/MovementLog');
const Product = require('./models/Product');
require('dotenv').config();

async function checkData() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
  const logs = await MovementLog.find().populate('product');
  let totalRev = 0;
  
  console.log('Total logs:', logs.length);
  logs.forEach(log => {
    if (!['Restock', 'Found', 'Return'].includes(log.reason)) {
       const p = log.product;
       const price = p ? (p.sellingPrice || p.purchasePrice || 10) : 10;
       const rev = log.quantityMoved * price;
       console.log(`Log ID: ${log._id}, Quant: ${log.quantityMoved}, Reason: ${log.reason}, Found Product: ${p ? p.name : 'NO'}, Price used: ${price}, Revenue added: ${rev}`);
       totalRev += rev;
    }
  });
  console.log('Total calculated revenue:', totalRev);
  process.exit(0);
}

checkData();
