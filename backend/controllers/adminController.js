const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboardStats = async (req, res) => {
  try {
    const PurchaseOrder = require('../models/PurchaseOrder');

    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalSuppliers = await Supplier.countDocuments();

    // Low stock: quantity > 0 but <= minStockLevel
    const lowStockProducts = await Product.countDocuments({
      $expr: { $and: [{ $gt: ['$quantity', 0] }, { $lte: ['$quantity', '$minStockLevel'] }] }
    });
    const outOfStockProducts = await Product.countDocuments({ quantity: 0 });

    // Total Inventory Value (Only Active products)
    const activeProducts = await Product.find({ status: 'Active' });
    let totalInventoryValue = 0;
    activeProducts.forEach(p => {
      totalInventoryValue += (p.sellingPrice * p.quantity);
    });

    // Daily Revenue — sum of today's completed PurchaseOrders
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const dailyOrders = await PurchaseOrder.find({
      status: 'Completed',
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });
    const dailyRevenue = dailyOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Monthly Revenue — sum of this calendar month's completed PurchaseOrders
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const monthOrders = await PurchaseOrder.find({
      status: 'Completed',
      createdAt: { $gte: monthStart, $lte: todayEnd }
    });
    const monthlyRevenue = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.json({
      totalProducts,
      totalCategories,
      totalSuppliers,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue,
      dailyRevenue,
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get all users (Managers & Staff)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = { role: { $in: ['Manager', 'Staff'] } };
    if (role && role !== 'all') query.role = role;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new user (Manager or Staff)
// @route   POST /api/admin/users
// @access  Private (Admin)
const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role, shopName, mobileNumber, gender, dob, address, city, state, pincode } = req.body;
    const exists = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (exists) return res.status(400).json({ message: 'User with this email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName, email, password: hashed, role,
      shopName: shopName || req.user.shopName,
      mobileNumber: mobileNumber || '0000000000',
      gender: gender || 'Other',
      dob: dob || new Date('1990-01-01'),
      address: address || 'N/A',
      city: city || 'N/A',
      state: state || 'N/A',
      pincode: pincode || '000000',
    });

    const userOut = user.toObject();
    delete userOut.password;
    res.status(201).json(userOut);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { fullName, email, role, shopName, mobileNumber, isActive } = req.body;
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (role) user.role = role;
    if (shopName) user.shopName = shopName;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    if (typeof isActive !== 'undefined') user.isActive = isActive;

    const updated = await user.save();
    const userOut = updated.toObject();
    delete userOut.password;
    res.json(userOut);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'Admin') return res.status(403).json({ message: 'Cannot delete admin accounts' });
    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ALL products across all shops (Admin only)
// @route   GET /api/admin/products
// @access  Private (Admin)
const getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .populate('addedBy', 'fullName')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get per-shop analytics (product count, value, activity)
// @route   GET /api/admin/shops
// @access  Private (Admin)
const getShopAnalytics = async (req, res) => {
  try {
    const MovementLog = require('../models/MovementLog');

    // Distinct shopNames from products
    const shopNames = await Product.distinct('shopName');

    const shops = await Promise.all(shopNames.map(async (shopName) => {
      const shopProducts = await Product.find({ shopName });
      const totalProducts = shopProducts.length;
      const lowStock = shopProducts.filter(p => p.quantity > 0 && p.quantity <= p.minStockLevel).length;
      const outOfStock = shopProducts.filter(p => p.quantity === 0).length;
      const inventoryValue = shopProducts
        .filter(p => p.status === 'Active')
        .reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0);

      // Last activity from movement logs
      const lastLog = await MovementLog.findOne({ shopName }).sort({ createdAt: -1 });
      const lastActivity = lastLog?.createdAt || null;

      // Manager for this shop
      const manager = await User.findOne({ shopName, role: { $in: ['Manager', 'Admin'] } }).select('fullName email');

      // Movement count last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentMovements = await MovementLog.countDocuments({ shopName, createdAt: { $gte: thirtyDaysAgo } });

      return {
        shopName, totalProducts, lowStock, outOfStock, inventoryValue,
        lastActivity, manager, recentMovements,
        isInactive: !lastActivity || new Date(lastActivity) < thirtyDaysAgo,
      };
    }));

    // Sort by recentMovements desc
    shops.sort((a, b) => b.recentMovements - a.recentMovements);
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all movement logs across all shops (Admin)
// @route   GET /api/admin/movements
// @access  Private (Admin)
const getMovementReport = async (req, res) => {
  try {
    const MovementLog = require('../models/MovementLog');
    const { shop, reason, from, to } = req.query;
    let query = {};
    if (shop && shop !== 'all') query.shopName = { $regex: shop, $options: 'i' };
    if (reason && reason !== 'all') query.reason = reason;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }

    const logs = await MovementLog.find(query)
      .populate('product', 'name productId')
      .populate('movedBy', 'fullName role')
      .sort({ createdAt: -1 })
      .limit(500);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get category-wise analysis (stock totals, value, low stock)
// @route   GET /api/admin/categories/analysis
// @access  Private (Admin)
const getCategoryAnalysis = async (req, res) => {
  try {
    const cats = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'cat'
        }
      },
      { $unwind: { path: '$cat', preserveNullAndEmpty: true } },
      {
        $group: {
          _id: '$cat._id',
          categoryName: { $first: { $ifNull: ['$cat.name', 'Uncategorized'] } },
          totalProducts: { $sum: 1 },
          totalQty: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$sellingPrice', '$quantity'] } },
          lowStock: { $sum: { $cond: [{ $and: [{ $gt: ['$quantity', 0] }, { $lte: ['$quantity', '$minStockLevel'] }] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] } },
        }
      },
      { $sort: { totalProducts: -1 } }
    ]);
    res.json(cats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminDashboardStats, getAllUsers, createUser, updateUser, deleteUser,
  getAllProducts, getShopAnalytics, getMovementReport, getCategoryAnalysis
};