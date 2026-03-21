const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

async function checkDetailedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
    
    console.log('--- Managers Store Names ---');
    const managers = await User.find({ role: 'Manager' });
    managers.forEach(m => {
      console.log(`Manager: [${m.email}], Shop: [${m.shopName}], Length: ${m.shopName?.length}`);
    });

    console.log('\n--- Products Store Names ---');
    const products = await Product.find({});
    products.forEach(p => {
      console.log(`Product: [${p.name}], Shop: [${p.shopName}], Length: ${p.shopName?.length}, Status: [${p.status}]`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkDetailedData();
