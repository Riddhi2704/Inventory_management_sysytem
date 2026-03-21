const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists:', adminEmail);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const admin = await User.create({
        fullName: 'Default Admin',
        gender: 'Other',
        dob: new Date('1990-01-01'),
        mobileNumber: '1234567890',
        email: adminEmail,
        address: 'Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        pincode: '123456',
        password: hashedPassword,
        role: 'Admin',
        shopName: 'Main Store',
        adminId: 'ADMIN001'
      });

      console.log('Default Admin created:', admin.email);
      console.log('Password: admin123');
    }

    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
