const mongoose = require('mongoose');
const Product = require('./models/Product');
const MovementLog = require('./models/MovementLog');

async function checkCounts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/inventory_system');
    console.log('Connected to MongoDB');

    const shopName = 'Shriji kirayana store';

    const products = await Product.find({ shopName });
    console.log(`Products in ${shopName}:`, products.length);
    products.forEach(p => console.log(`- ${p.name} (Status: ${p.status})`));

    const logs = await MovementLog.find({ shopName });
    console.log(`Movement logs for ${shopName}:`, logs.length);
    logs.forEach(l => console.log(`- Log ID: ${l._id}, Product ID: ${l.product}, Reason: ${l.reason}`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCounts();
