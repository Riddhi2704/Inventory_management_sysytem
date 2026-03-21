const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./models/Product');
const User = require('./models/User');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const products = await Product.find({ name: { $in: ['wafer', 'oil', 'sugar'] } });
    console.log('--- Product ShopNames ---');
    products.forEach(p => {
      console.log(`Product: [${p.name}], ShopName: "${p.shopName}", Length: ${p.shopName?.length}`);
      if (p.shopName) {
        console.log(`  Hex: ${Buffer.from(p.shopName).toString('hex')}`);
      }
    });

    const users = await User.find({ email: 'sanjay@gmail.com' });
    console.log('\n--- User ShopNames ---');
    users.forEach(u => {
      console.log(`User: [${u.email}], ShopName: "${u.shopName}", Length: ${u.shopName?.length}`);
      if (u.shopName) {
        console.log(`  Hex: ${Buffer.from(u.shopName).toString('hex')}`);
      }
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
