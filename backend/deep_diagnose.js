const mongoose = require('mongoose');

async function diagnose() {
  try {
    const mongoUri = 'mongodb://localhost:27017/inventory_system';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    const UserSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', UserSchema, 'users');
    
    const ProductSchema = new mongoose.Schema({}, { strict: false });
    const Product = mongoose.model('Product', ProductSchema, 'products');
    
    const manager = await User.findOne({ email: 'sanjay@gmail.com' });
    if (!manager) {
      console.log('Manager sanjay@gmail.com not found');
    } else {
      console.log(`Manager: ${manager.fullName}, Shop: [${manager.shopName}], JSON: ${JSON.stringify(manager.shopName)}`);
      console.log(`Type: ${typeof manager.shopName}, Length: ${manager.shopName?.length}`);
    }

    const products = await Product.find({ shopName: { $exists: true } }).limit(20);
    console.log('\n--- Sample Products ---');
    products.forEach(p => {
      console.log(`Product: ${p.name}, Shop: [${p.shopName}], JSON: ${JSON.stringify(p.shopName)}, Length: ${p.shopName?.length}`);
    });

    if (manager && manager.shopName) {
      const regex = new RegExp(`^${manager.shopName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      const count = await Product.countDocuments({ shopName: { $regex: regex } });
      console.log(`\nQuery with regex [${regex}]: Count = ${count}`);
      
      const exactCount = await Product.countDocuments({ shopName: manager.shopName });
      console.log(`Exact Match Count: ${exactCount}`);

      const partialCount = await Product.countDocuments({ shopName: { $regex: manager.shopName, $options: 'i' } });
      console.log(`Partial Regex Match Count: ${partialCount}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

diagnose();
