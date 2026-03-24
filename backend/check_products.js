const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const Product = require('./models/Product');

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
  console.log('Connected');
  // Just dump all unique products
  const products = await Product.find({ shopName: /Riddhi Mobile/i, status: 'Active' });
  console.log(`Found ${products.length} Active products for Riddhi Mobile.`);
  products.forEach(p => console.log(`- ${p.name} (${p.brand}) [${p._id}]`));
  process.exit();
}
check();
