const mongoose = require('mongoose');

async function checkData() {
  try {
    const mongoUri = 'mongodb://localhost:27017/inventory_system';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    const ProductSchema = new mongoose.Schema({}, { strict: false });
    const Product = mongoose.model('Product', ProductSchema, 'products');
    
    const products = await Product.find({}, 'name status productId');
    console.log('--- All Products ---');
    products.forEach(p => {
      console.log(`ID: ${p.productId}, Name: ${p.name}, Status: ${p.status}`);
    });
    console.log('Total Count:', products.length);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkData();
