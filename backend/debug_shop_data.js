const mongoose = require('mongoose');
const Supplier = require('./models/Supplier');
const User = require('./models/User');
require('dotenv').config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log("--- USERS ---");
    const users = await User.find({});
    users.forEach(u => console.log(`ID: ${u._id}, Name: ${u.fullName}, Role: ${u.role}, Shop: [${u.shopName}]`));
    
    console.log("\n--- SUPPLIERS ---");
    const suppliers = await Supplier.find({});
    suppliers.forEach(s => console.log(`ID: ${s._id}, Name: ${s.name}, Shop: [${s.shopName}]`));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
