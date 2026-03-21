const mongoose = require('mongoose');

function toHex(str) {
  return str.split('').map(c => c.charCodeAt(0).toString(16).padStart(4, '0')).join(' ');
}

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
    if (manager) {
      console.log(`Manager: ${manager.fullName}`);
      console.log(`Shop Name: [${manager.shopName}]`);
      console.log(`Hex: ${toHex(manager.shopName || '')}`);
    }

    const products = await Product.find({ shopName: /Shriji/i }).limit(5);
    console.log('\n--- Sample Products (Shriji) ---');
    products.forEach(p => {
      console.log(`Product: ${p.name}`);
      console.log(`Shop Name: [${p.shopName}]`);
      console.log(`Hex: ${toHex(p.shopName || '')}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

diagnose();
