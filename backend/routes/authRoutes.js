const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  forgotPassword,
  resetPassword,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Aliases for /api/users/profile as requested
router.get('/api/users/profile', protect, getUserProfile);
router.put('/api/users/profile', protect, updateUserProfile);

module.exports = router;
