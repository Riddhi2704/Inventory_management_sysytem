const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const Product = require('./models/Product');

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
  console.log('Connected');
  const products = await Product.find({ status: 'Active' });
  
  const byShop = {};
  for(let p of products) {
    byShop[p.shopName] = (byShop[p.shopName] || 0) + 1;
  }
  console.log(byShop);
  process.exit();
}
check();
