const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function checkQuantities() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
    
    const products = await Product.find({ shopName: /Shriji/i });
    console.log(`--- Products for Shriji (${products.length} found) ---`);
    products.forEach(p => {
      console.log(`Product: [${p.name}], Qty: ${p.quantity}, Buy: ${p.purchasePrice}, Sell: ${p.sellingPrice}, Status: ${p.status}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkQuantities();
