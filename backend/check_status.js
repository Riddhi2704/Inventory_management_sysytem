const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const Product = require('./models/Product');

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
  console.log('Connected');
  const counts = await Product.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  console.log(counts);
  process.exit();
}
check();
