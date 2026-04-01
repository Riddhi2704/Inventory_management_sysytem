const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./backend/models/User');
require('dotenv').config({ path: './backend/.env' });

async function verify() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = 'riddhisanjaykumarpatel@gmail.com';
  const user = await User.findOne({ email });
  if (!user) {
    console.log('User not found');
  } else {
    const isMatch = await bcrypt.compare('Riddhi@2704', user.password);
    console.log('Password match:', isMatch);
  }
  process.exit(0);
}

verify();
