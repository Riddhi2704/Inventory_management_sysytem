const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./models/Product');
const User = require('./models/User');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const userEmail = 'sanjay@gmail.com';
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log(`User ${userEmail} not found!`);
      process.exit(1);
    }

    console.log('--- User Identity ---');
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`ShopName (DB): "${user.shopName}" (Length: ${user.shopName?.length})`);
    
    // Check for products matching this shop name exactly
    const exactProducts = await Product.find({ shopName: user.shopName });
    console.log(`\n--- Exact Match Check ---`);
    console.log(`Products matching "${user.shopName}" exactly: ${exactProducts.length}`);

    // Check for products matching case-insensitively
    const regex = new RegExp(user.shopName?.trim(), 'i');
    const regexProducts = await Product.find({ shopName: regex });
    console.log(`\n--- Regex Match Check (i, trim) ---`);
    console.log(`Products matching /${user.shopName?.trim()}/i: ${regexProducts.length}`);
    
    if (regexProducts.length > 0) {
      console.log('\nSample Product ShopNames:');
      regexProducts.slice(0, 3).forEach(p => {
        console.log(`- Product: [${p.name}], Shop: "${p.shopName}" (Length: ${p.shopName?.length})`);
      });
    }

    // Check all products for this user
    const addedProducts = await Product.find({ addedBy: user._id });
    console.log(`\n--- AddedBy Check ---`);
    console.log(`Products added by this user ID: ${addedProducts.length}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
