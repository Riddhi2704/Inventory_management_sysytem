const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./models/Product');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');
const User = require('./models/User');

async function simulateGetProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Simulate req.user
    const user = {
      email: 'teststaff@example.com',
      shopName: 'Shriji kirayana store'
    };

    const shopName = user.shopName?.trim();
    if (!shopName) {
      console.log('User does not belong to a shop');
      process.exit(1);
    }

    const queryParams = {}; // Simulation of req.query
    const { search, category, status, lowStock } = queryParams;

    console.log(`[Sim] Request from user: ${user.email}, Shop: [${shopName}]`);
    
    const shopFilter = { shopName: { $regex: shopName, $options: 'i' } };
    let query = { ...shopFilter };
    
    // Pagination defaults
    const page = 1;
    const limit = 1000;
    const skip = (page - 1) * limit;

    console.log('[Sim] Final query before execution:', JSON.stringify(query));

    const total = await Product.countDocuments(query);
    console.log(`[Sim] countDocuments complete: ${total}`);

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .populate('addedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    console.log(`[Sim] find complete: Found ${products.length} products`);
    
    process.exit(0);
  } catch (error) {
    console.error('[Sim] CRASH DETECTED:');
    console.error(error);
    process.exit(1);
  }
}

simulateGetProducts();
