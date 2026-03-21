const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function listAllUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
    const users = await User.find({});
    console.log('--- All Users ---');
    users.forEach(u => {
      console.log(`Email: ${u.email}, Role: ${u.role}, Shop: ${u.shopName}, Password Hash: ${u.password.substring(0, 10)}...`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
listAllUsers();
