const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function fixManager() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const email = 'sanjay@gmail.com';
  const user = await User.findOne({ email });
  
  if (!user) {
    console.log('Manager not found!');
  } else {
    console.log('Current Manager Data:', JSON.stringify({
      email: user.email,
      shopName: user.shopName,
      role: user.role
    }));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash('Sanjay@123', salt);
    await user.save();
    console.log('Password reset to: Sanjay@123');
  }
  process.exit(0);
}

fixManager();
