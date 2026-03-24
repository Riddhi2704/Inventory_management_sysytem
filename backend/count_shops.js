const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Product = require('./models/Product');

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
  console.log('Connected to DB');

  const userShops = await User.distinct('shopName');
  const productShops = await Product.distinct('shopName');

  const allShops = [...new Set([...userShops, ...productShops])].filter(Boolean);

  console.log(`\nTotal unique shops: ${allShops.length}`);
  console.log('--- List of Shop Names ---');
  allShops.forEach((shop, index) => {
    console.log(`${index + 1}. ${shop}`);
  });

  process.exit(0);
}

check();
