const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role, shopName) => {
  return jwt.sign({ id, role, shopName }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { 
      fullName, gender, dob, mobileNumber, email, address, city, state, pincode, password, role, shopName,
      adminId, adminEducation,
      managerId, department, education, experienceYears,
      staffId, shiftTime
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userDetails = {
      fullName, gender, dob, mobileNumber, email, address, city, state, pincode, password: hashedPassword, role, shopName
    };

    if (role === 'Admin') {
      userDetails.adminId = adminId;
      userDetails.adminEducation = adminEducation;
    } else if (role === 'Manager') {
      userDetails.managerId = managerId;
      userDetails.department = department;
      userDetails.education = education;
      userDetails.experienceYears = experienceYears;
    } else if (role === 'Staff') {
      userDetails.staffId = staffId;
      userDetails.shiftTime = shiftTime;
    }

    const user = await User.create(userDetails);

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        shopName: user.shopName,
        token: generateToken(user._id, user.role, user.shopName)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        shopName: user.shopName,
        token: generateToken(user._id, user.role, user.shopName)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.mobileNumber = req.body.mobileNumber || user.mobileNumber;
      user.profilePhoto = req.body.profilePhoto || user.profilePhoto;
      
      user.address = req.body.address || user.address;
      user.city = req.body.city || user.city;
      user.state = req.body.state || user.state;
      user.pincode = req.body.pincode || user.pincode;
      
      if (req.body.shiftTime) {
        user.shiftTime = req.body.shiftTime;
      }

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        address: updatedUser.address,
        city: updatedUser.city,
        state: updatedUser.state,
        pincode: updatedUser.pincode,
        role: updatedUser.role,
        shopName: updatedUser.shopName,
        shiftTime: updatedUser.shiftTime,
        profilePhoto: updatedUser.profilePhoto,
        token: generateToken(updatedUser._id, updatedUser.role, updatedUser.shopName)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with that email address.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  resetPassword
};
