const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const mongoose = require('mongoose');

// @desc    Add a new product
// @route   POST /api/products
// @access  Private (Staff, Manager, Admin)
const addProduct = async (req, res) => {
  try {
    const { productId, name, category, brand, supplier, purchasePrice, sellingPrice, quantity, description, storageLocation, productImage } = req.body;
    const shopName = req.user.shopName;

    if (!shopName) {
      return res.status(400).json({ message: 'User does not belong to a shop' });
    }

    let finalSupplierId = supplier;
    if (supplier && !(/^[0-9a-fA-F]{24}$/.test(supplier))) {
      let existingSupplier = await Supplier.findOne({ name: { $regex: new RegExp(`^${supplier}$`, 'i') } });
      if (!existingSupplier) {
        existingSupplier = await Supplier.create({ name: supplier });
      }
      finalSupplierId = existingSupplier._id;
    }

    let finalCategoryId = category;
    if (category && !(/^[0-9a-fA-F]{24}$/.test(category))) {
      let existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      if (!existingCategory) {
        existingCategory = await Category.create({ name: category });
      }
      finalCategoryId = existingCategory._id;
    }

    // Determine initial status based on role
    // As per docs: "Staff adds a new product -> status becomes Pending Approval"
    let status = 'Pending Approval';
    if (req.user.role === 'Manager' || req.user.role === 'Admin') {
      status = 'Active'; // Assume Managers/Admins can add directly as Active (optional, but standard)
    }

    const product = await Product.create({
      productId, name, category: finalCategoryId, brand, supplier: finalSupplierId, purchasePrice, sellingPrice, quantity, description, storageLocation, productImage,
      shopName,
      status,
      addedBy: req.user.id
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products (with search/filter)
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const { search, category, status, lowStock } = req.query;
    let query = {};
    
    // Enforce shop-based filtering
    if (req.user && req.user.shopName) {
      query.shopName = req.user.shopName;
    }

    console.log("GET Products Query Params:", req.query);
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { productId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (lowStock === 'true') {
      // Find where quantity <= minStockLevel
      query.$expr = { $lte: ['$quantity', '$minStockLevel'] };
    }
    if (category) {
      // Assuming category is passed as an ObjectId or we would need to map category name to ID
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    // Role-based filtering removed to allow all Staff members in the same shop to see shop products

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name');
      
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or Reject Product
// @route   PUT /api/products/:id/status
// @access  Private (Manager)
const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Active', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      product.status = status;
      product.approvedBy = req.user.id;
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Product Quantity
// @route   PUT /api/products/:id/quantity
// @access  Private (Staff, Manager)
const updateProductQuantity = async (req, res) => {
  try {
    const { quantityAdded } = req.body; // can be negative for removed
    
    const product = await Product.findById(req.params.id);

    if (product) {
      product.quantity += Number(quantityAdded);
      const updatedProduct = await product.save();

      // Here you would also create a MovementLog ideally

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addProduct, getProducts, updateProductStatus, updateProductQuantity };
