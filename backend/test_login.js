const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function verify() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system';
    console.log('Connecting to', mongoUri);
    await mongoose.connect(mongoUri);
    const email = 'riddhisanjaykumarpatel@gmail.com';
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user) {
      console.log('User not found:', email);
    } else {
      console.log('User found:', user.email);
      const isMatch = await bcrypt.compare('Riddhi@2704', user.password);
      console.log('Password match:', isMatch);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verify();
