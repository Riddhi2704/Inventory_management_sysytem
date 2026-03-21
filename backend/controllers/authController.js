const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

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

    const userExists = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
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
    // Case-insensitive search for email
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (!user) {
      console.log(`Login Failed: User not found [${email}]`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login Failed: Password mismatch for [${email}]`);
      return res.status(401).json({ message: 'you enter the wrong password' });
    }

    console.log(`Login Success: [${email}] - Shop: [${user.shopName}]`);
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      shopName: user.shopName,
      token: generateToken(user._id, user.role, user.shopName)
    });
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
      if (req.body.department) {
        user.department = req.body.department;
      }

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        ...updatedUser._doc,
        password: undefined,
        token: generateToken(updatedUser._id, updatedUser.role, updatedUser.shopName)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

    await user.save();

    // Create reset url (Frontend URL)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4f46e5; margin-bottom: 5px;">Password Reset Request</h2>
          <p style="color: #6b7280; font-size: 14px;">Inventory Management System</p>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <p style="color: #374151; line-height: 1.6;">You are receiving this email because you (or someone else) requested a password reset for your account.</p>
          <p style="color: #374151; line-height: 1.6;">Please click on the button below to complete the process:</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">Reset My Password</a>
        </div>
        <div style="border-top: 1px solid #f3f4f6; pt: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
          <p>This link will expire in <b>15 minutes</b>.</p>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        html: message,
      });

      res.status(200).json({ message: 'Email sent successfully' });
    } catch (err) {
      console.error('Email sending failed:', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent. Please check your email configuration.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password with token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    
    // Get hashed token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.status(200).json({ message: 'Password reset successfully! You can now login with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'It is wrong password' });
    }

    // Validate new password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'Password must be strong: at least 8 characters, one uppercase, one lowercase and one special character' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  forgotPassword,
  resetPassword,
  changePassword
};
