const mongoose = require('mongoose');

async function checkCount() {
  try {
    const mongoUri = 'mongodb://localhost:27017/inventory_system';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Define a simple schema to count
    const ProductSchema = new mongoose.Schema({}, { strict: false });
    const Product = mongoose.model('Product', ProductSchema, 'products');
    
    const count = await Product.countDocuments();
    console.log('Total Products in Database:', count);
    
    const pendingCount = await Product.countDocuments({ status: 'Pending Approval' });
    console.log('Pending Approval Products:', pendingCount);
    
    const approvedCount = await Product.countDocuments({ status: 'Approved' });
    console.log('Approved Products:', approvedCount);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkCount();
