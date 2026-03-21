const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createTestManager() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
    
    // Check if user already exists
    const existing = await User.findOne({ email: 'testmanager@example.com' });
    if (existing) {
      await User.deleteOne({ email: 'testmanager@example.com' });
    }

    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await User.create({
      fullName: 'Test Manager',
      gender: 'Male',
      dob: new Date('1990-01-01'),
      mobileNumber: '1234567890',
      email: 'testmanager@example.com',
      address: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      password: hashedPassword,
      role: 'Manager',
      shopName: 'Test Shop',
      managerId: 'MGR-TEST-001',
      department: 'Inventory Management',
      education: 'Bachelor',
      experienceYears: 5
    });
    
    console.log('Test Manager created:', user.email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createTestManager();
