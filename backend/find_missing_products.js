const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./models/Product');
const User = require('./models/User');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({}).populate('addedBy', 'email shopName');
    console.log(`Total Products in DB: ${products.length}`);
    
    products.forEach((p, i) => {
      console.log(`${i+1}. Name: [${p.name}], Shop: [${p.shopName}], Status: [${p.status}], AddedBy: [${p.addedBy?.email}], UserShop: [${p.addedBy?.shopName}]`);
    });

    const users = await User.find({});
    console.log('\nUsers in DB:');
    users.forEach(u => {
      console.log(`Email: [${u.email}], Role: [${u.role}], Shop: [${u.shopName}]`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
