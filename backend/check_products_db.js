const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const products = await Product.find({});
    console.log(JSON.stringify(products.map(p => ({ 
      name: p.name, 
      status: p.status, 
      shop: p.shopName 
    })), null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkProducts();
