const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find any user with role 'Staff'
    const staffUsers = await User.find({ role: 'Staff' });
    console.log(`Found ${staffUsers.length} staff users.`);
    
    staffUsers.forEach(u => {
      console.log(`- Email: ${u.email}, ShopName: "${u.shopName}" (Length: ${u.shopName?.length})`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
