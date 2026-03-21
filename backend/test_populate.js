const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Require all models so they are registered for populate
const Product = require('./models/Product');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');
const User = require('./models/User');

async function testPopulate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const shopName = 'Shriji kirayana store';
    const query = { shopName: { $regex: shopName, $options: 'i' } };
    
    console.log('Running query with populate...');
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .populate('addedBy', 'fullName')
      .sort({ createdAt: -1 })
      .limit(1000);
      
    console.log(`SUCCESS: Found ${products.length} products.`);
    products.forEach(p => {
      console.log(` - ${p.name}: category=${JSON.stringify(p.category)}, supplier=${JSON.stringify(p.supplier)}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('CRASH DURING POPULATE:');
    console.error(err.name + ':', err.message);
    process.exit(1);
  }
}

testPopulate();
