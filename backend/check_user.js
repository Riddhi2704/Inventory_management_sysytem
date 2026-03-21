const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
    const users = await User.find({ role: 'Manager' });
    console.log('--- Managers ---');
    users.forEach(u => console.log(`User: ${u.username}, Email: ${u.email}, Shop: "${u.shopName}"`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkUser();
