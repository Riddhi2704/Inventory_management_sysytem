const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const MovementLog = require('./models/MovementLog');
require('dotenv').config();

async function simulateStats() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
    
    const managers = await User.find({ role: 'Manager' });
    
    for (const user of managers) {
      console.log(`\n--- Simulating for Manager: ${user.email} (Shop: [${user.shopName}]) ---`);
      const shopName = user.shopName;
      
      const totalProducts = await Product.countDocuments({ shopName });
      const outOfStock = await Product.countDocuments({ shopName, quantity: 0 });
      const pendingApproval = await Product.countDocuments({ shopName, status: 'Pending Approval' });
      const lowStock = await Product.countDocuments({ shopName, quantity: { $gt: 0, $lt: 5 } });
      
      console.log(`Summary: total=${totalProducts}, outOfStock=${outOfStock}, pending=${pendingApproval}, lowStock=${lowStock}`);
      
      const products = await Product.find({ shopName });
      let totalInventoryValue = 0;
      products.forEach(p => {
        totalInventoryValue += (p.sellingPrice * p.quantity);
      });
      console.log(`Inventory Value: ₹${totalInventoryValue}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
simulateStats();
