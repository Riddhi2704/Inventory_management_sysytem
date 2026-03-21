const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const email = 'teststaff@example.com';
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Test user already exists. Deleting...');
      await User.deleteOne({ email });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password@123', salt);

    const testStaff = new User({
      fullName: 'Test Staff',
      gender: 'Male',
      dob: new Date('1990-01-01'),
      mobileNumber: '1234567890',
      email: email,
      address: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      password: hashedPassword,
      role: 'Staff',
      shopName: 'Shriji kirayana store',
      staffId: 'STAFF' + Math.floor(Math.random() * 1000),
      shiftTime: 'Morning'
    });

    await testStaff.save();
    console.log('Test Staff user created successfully!');
    console.log('Email: teststaff@example.com');
    console.log('Password: Password@123');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
