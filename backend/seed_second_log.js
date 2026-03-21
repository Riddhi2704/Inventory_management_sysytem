const mongoose = require('mongoose');
const Product = require('./models/Product');
const MovementLog = require('./models/MovementLog');
const User = require('./models/User');

async function seedSecondLog() {
  try {
    await mongoose.connect('mongodb://localhost:27017/inventory_system');
    console.log('Connected to MongoDB');

    const shopName = 'Shriji kirayana store';
    
    // Find the product without logs (conditioner)
    const product = await Product.findOne({ name: 'conditioner', shopName });
    const user = await User.findOne({ role: 'Manager', shopName });

    if (product && user) {
      const newLog = new MovementLog({
        product: product._id,
        quantityMoved: 5,
        movedBy: user._id,
        reason: 'Restock',
        shopName
      });
      await newLog.save();
      console.log(`Movement log created for ${product.name}.`);
    } else {
      console.log('Product or User not found.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedSecondLog();
