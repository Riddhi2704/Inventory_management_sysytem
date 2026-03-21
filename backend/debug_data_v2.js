const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
const MovementLog = require('./models/MovementLog');
require('dotenv').config();

async function debugData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
    console.log('Connected to MongoDB');

    const products = await Product.find({}).populate('category');
    console.log('--- Products Info ---');
    products.forEach(p => {
      console.log(`Product: ${p.name}, Shop: ${p.shopName}, Category: ${p.category?.name || 'N/A'}, Status: ${p.status}`);
    });

    const categories = await Category.find({});
    console.log('--- Categories ---');
    categories.forEach(c => console.log(`Category: ${c.name}, ID: ${c._id}`));

    const logs = await MovementLog.find({});
    console.log(`--- Movement Logs Count: ${logs.length} ---`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
debugData();
