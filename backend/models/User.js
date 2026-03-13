const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  dob: { type: Date, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  password: { type: String, required: true },
  profilePhoto: { type: String },
  role: { type: String, enum: ['Admin', 'Manager', 'Staff'], required: true },
  shopName: { type: String, required: true },
  
  // Specific to Admin
  adminId: { type: String, unique: true, sparse: true },
  adminEducation: { type: String },
  
  // Specific to Manager
  managerId: { type: String, unique: true, sparse: true },
  department: { type: String, enum: ['Inventory Management', 'Product Management'] },
  education: { type: String },
  experienceYears: { type: Number },
  
  // Specific to Staff
  staffId: { type: String, unique: true, sparse: true },
  shiftTime: { type: String, enum: ['Morning', 'Evening', 'Night'] },

  joiningDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
