const mongoose = require('mongoose');

async function listProducts() {
  try {
    const mongoUri = 'mongodb://localhost:27017/inventory_system';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    const ProductSchema = new mongoose.Schema({}, { strict: false });
    const Product = mongoose.model('Product', ProductSchema, 'products');
    
    const products = await Product.find({}, { name: 1, shopName: 1, status: 1 });
    console.log('--- All Products ---');
    products.forEach(p => {
      console.log(`Name: ${p.name}, Shop: [${p.shopName}], Status: ${p.status}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

listProducts();
