const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getCategories)
  .post(protect, authorize('Manager', 'Admin'), createCategory);

router.route('/:id')
  .put(protect, authorize('Manager', 'Admin'), updateCategory)
  .delete(protect, authorize('Manager', 'Admin'), deleteCategory);

module.exports = router;
