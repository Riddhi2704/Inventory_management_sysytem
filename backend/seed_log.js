const mongoose = require('mongoose');
const MovementLog = require('./models/MovementLog');
const Product = require('./models/Product');
const User = require('./models/User');

async function testApi() {
  try {
    await mongoose.connect('mongodb://localhost:27017/inventory_system');
    console.log('Connected to MongoDB');
    
    const product = await Product.findOne({ shopName: 'Shriji kirayana store' });
    const user = await User.findOne({ role: 'Manager', shopName: 'Shriji kirayana store' });

    if (product && user) {
      const newLog = new MovementLog({
        product: product._id,
        quantityMoved: 10,
        movedBy: user._id,
        reason: 'Restock',
        shopName: 'Shriji kirayana store'
      });
      await newLog.save();
      console.log('Dummy movement log created.');
    } else {
      console.log('Product or User not found for shop.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testApi();
