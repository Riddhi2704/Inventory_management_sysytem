const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const MovementLog = require('../models/MovementLog');
const mongoose = require('mongoose');

// @desc    Add a new product
// @route   POST /api/products
// @access  Private (Staff, Manager, Admin)
const addProduct = async (req, res) => {
  try {
    const { productId, name, category, brand, supplier, purchasePrice, sellingPrice, quantity, unitType, description, storageLocation, productImage } = req.body;
    const shopName = req.user.shopName;

    if (!shopName) {
      return res.status(400).json({ message: 'User does not belong to a shop' });
    }

    let finalSupplierId = supplier;
    if (supplier && !(/^[0-9a-fA-F]{24}$/.test(supplier))) {
      let existingSupplier = await Supplier.findOne({ 
        name: { $regex: new RegExp(`^${supplier}$`, 'i') },
        shopName 
      });
      if (!existingSupplier) {
        existingSupplier = await Supplier.create({ name: supplier, shopName });
      }
      finalSupplierId = existingSupplier._id;
    }

    let finalCategoryId = category;
    if (category && !(/^[0-9a-fA-F]{24}$/.test(category))) {
      let existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${category}$`, 'i') }
      });
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

    // Check for duplicate product (same name and brand, case-insensitive, trimmed)
    const trimmedName = name?.trim();
    const trimmedBrand = brand ? brand.trim() : '';

    const existingProduct = await Product.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      brand: { $regex: new RegExp(`^${trimmedBrand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      shopName: { $regex: new RegExp(`^${shopName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });

    if (existingProduct) {
      return res.status(400).json({ message: 'Product already exists with this brand' });
    }

    const product = await Product.create({
      productId, name, category: finalCategoryId, brand, supplier: finalSupplierId, purchasePrice, sellingPrice, quantity, unitType, description, storageLocation, productImage,
      shopName,
      status,
      addedBy: req.user.id
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product's details
// @route   PUT /api/products/:id
// @access  Private (Staff, Manager, Admin)
const updateProduct = async (req, res) => {
  try {
    const shopName = req.user.shopName;
    const shopNameRegex = new RegExp(`^${shopName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const product = await Product.findOne({ _id: req.params.id, shopName: shopNameRegex });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or access denied' });
    }

    const { name, brand, quantity, unitType, purchasePrice, sellingPrice, storageLocation, description, category, minStockLevel } = req.body;

    // Handle category: might be an ObjectId or a name string
    let finalCategoryId = category;
    if (category && !(/^[0-9a-fA-F]{24}$/.test(category))) {
      let existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${category}$`, 'i') }
      });
      if (!existingCategory) {
        existingCategory = await Category.create({ name: category });
      }
      finalCategoryId = existingCategory._id;
    }

    // Check for duplicate product (same name and brand, case-insensitive, trimmed)
    if (name !== undefined || brand !== undefined) {
      const newName = (name !== undefined ? name : product.name).trim();
      const newBrand = (brand !== undefined ? brand : product.brand || '').trim();

      console.log(`[updateProduct] Checking duplicate for: Name=[${newName}], Brand=[${newBrand}], Shop=[${shopName}]`);

      const duplicateQuery = {
        _id: { $ne: req.params.id }, // Exclude current product
        name: { $regex: new RegExp(`^${newName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        shopName: shopNameRegex
      };

      if (newBrand) {
        duplicateQuery.brand = { $regex: new RegExp(`^${newBrand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
      } else {
        // Match if brand is empty, null, or missing
        duplicateQuery.$or = [
          { brand: { $exists: false } },
          { brand: null },
          { brand: "" }
        ];
      }

      const existingProduct = await Product.findOne(duplicateQuery);

      if (existingProduct) {
        console.log(`[updateProduct] Found duplicate product: ${existingProduct._id}`);
        return res.status(400).json({ message: 'Product already exists with this brand' });
      }
    }

    if (name !== undefined) product.name = name;
    if (brand !== undefined) product.brand = brand;
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (unitType !== undefined) product.unitType = unitType;
    if (purchasePrice !== undefined) product.purchasePrice = Number(purchasePrice);
    if (sellingPrice !== undefined) product.sellingPrice = Number(sellingPrice);
    if (storageLocation !== undefined) product.storageLocation = storageLocation;
    if (description !== undefined) product.description = description;
    if (minStockLevel !== undefined) product.minStockLevel = Number(minStockLevel);
    if (finalCategoryId) product.category = finalCategoryId;

    const updatedProduct = await product.save();

    // Log the edit action in Recent Activity
    await MovementLog.create({
      product: updatedProduct._id,
      quantityMoved: updatedProduct.quantity,
      movedBy: req.user.id,
      reason: 'Edited',
      shopName
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products (with search/filter)
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const shopName = req.user.shopName?.trim();
    if (!shopName && req.user.role !== 'Admin') {
      return res.status(400).json({ message: 'User does not belong to a shop' });
    }
    const { search, category, status, lowStock } = req.query;
    console.log(`[getProducts] UserID: ${req.user.id}, Role: ${req.user.role}, Shop: [${shopName}]`);
    console.log(`[getProducts] Query Params: ${JSON.stringify(req.query)}`);
    
    // Use a more relaxed filter first to diagnose
    let query = {};
    if (req.user.role !== 'Admin') {
      const safeShopName = shopName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
      query.shopName = { $regex: new RegExp(`^${safeShopName}$`, 'i') };
    }
    console.log('[getProducts] Constructed base query:', JSON.stringify(query));
    
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
    if (category) query.category = category;
    if (status) query.status = status;
    if (req.query.supplier) query.supplier = req.query.supplier; // Handle supplier filter

    // Stock Status Filter (Special Logic)
    if (req.query.stockStatus) {
      if (req.query.stockStatus === 'Low Stock') {
        query.$expr = { $and: [
          { $gt: ['$quantity', 0] },
          { $lte: ['$quantity', '$minStockLevel'] }
        ]};
      } else if (req.query.stockStatus === 'Out of Stock') {
        query.quantity = 0;
      } else if (req.query.stockStatus === 'In Stock') {
        query.$expr = { $gt: ['$quantity', '$minStockLevel'] };
      }
    }

    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$minStockLevel'] };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000; // Default large limit if not specified
    const skip = (page - 1) * limit;

    console.log('[getProducts] Final query before execution:', JSON.stringify(query));

    // Support unique products by name and brand if requested
    if (req.query.unique === 'true') {
      const pipeline = [
        { $match: query },
        { $sort: { createdAt: -1 } }, // Pick newest first
        { 
          $group: {
            _id: { name: "$name", brand: "$brand", shopName: "$shopName" },
            doc: { $first: "$$ROOT" }
          }
        },
        { $replaceRoot: { newRoot: "$doc" } },
        { $sort: { createdAt: -1 } }
      ];

      // Handle pagination within aggregation
      const pageNum = parseInt(req.query.page) || 1;
      const limitNum = parseInt(req.query.limit) || 1000;
      const skipAmount = (pageNum - 1) * limitNum;

      const results = await Product.aggregate([
        ...pipeline,
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $skip: skipAmount }, { $limit: limitNum }]
          }
        }
      ]);

      const products = results[0].data;
      const total = results[0].metadata[0]?.total || 0;

      // Populate manually since aggregate doesn't support .populate()
      const populatedProducts = await Product.populate(products, [
        { path: 'category', select: 'name' },
        { path: 'supplier', select: 'name' },
        { path: 'addedBy', select: 'fullName' }
      ]);

      if (req.query.paginate === 'true') {
        return res.json({
          products: populatedProducts,
          pagination: {
            total,
            page: parseInt(req.query.page) || 1,
            limit: limitNum,
            pages: Math.ceil(total / limitNum)
          }
        });
      }
      return res.json(populatedProducts);
    }

    const total = await Product.countDocuments(query);
    console.log(`[getProducts] countDocuments complete: ${total}`);

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .populate('addedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    console.log(`[getProducts] find complete: Found ${products.length} products`);
    console.log(`[getProducts] Found ${total} total documents, returning ${products.length} products`);
    
    // Backwards Compatibility:
    // If frontend requests pagination, return object. Otherwise return array.
    if (req.query.paginate === 'true') {
      res.json({
        products,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } else {
      res.json(products);
    }
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
    const shopName = req.user.shopName;
    
    if (!['Active', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const product = await Product.findOne({ _id: req.params.id, shopName });

    if (product) {
      product.status = status;
      product.approvedBy = req.user.id;
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found or access denied' });
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

      // Create a MovementLog for the stock update
      await MovementLog.create({
        product: updatedProduct._id,
        quantityMoved: Math.abs(quantityAdded),
        movedBy: req.user.id,
        reason: quantityAdded >= 0 ? 'Restock' : 'Adjustment',
        shopName: req.user.shopName
      });

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Staff, Manager, Admin)
const deleteProduct = async (req, res) => {
  try {
    const shopName = req.user.shopName;
    const product = await Product.findOne({ _id: req.params.id, shopName }).populate('category', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found or access denied' });
    }

    // Log the delete action in Recent Activity before removing
    await MovementLog.create({
      product: product._id,
      quantityMoved: product.quantity || 0,
      movedBy: req.user.id,
      reason: `Deleted`,
      shopName,
      productName: product.name,
      categoryName: product.category ? product.category.name : 'N/A'
    });

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Product Summary Stats
// @route   GET /api/products/stats
// @access  Private
const getProductStats = async (req, res) => {
  try {
    const shopName = req.user.shopName?.trim();
    const shopFilter = { shopName: { $regex: shopName, $options: 'i' } };
    
    console.log(`[getProductStats] UserID: ${req.user.id}, Role: ${req.user.role}, Shop: [${shopName}]`);
    if (!shopName) {
      return res.status(400).json({ message: 'Shop name not found' });
    }
    
    console.log(`[getProductStats] Applied filter:`, shopFilter);

    const totalProducts = await Product.countDocuments({ ...shopFilter, status: 'Active' });
    const outOfStock = await Product.countDocuments({ ...shopFilter, quantity: 0 });
    const lowStock = await Product.countDocuments({ 
      ...shopFilter, 
      $expr: { $and: [
        { $gt: ['$quantity', 0] },
        { $lte: ['$quantity', '$minStockLevel'] }
      ]}
    });

    const activeProducts = await Product.find({ ...shopFilter, status: 'Active' });
    let totalInventoryValue = 0;
    activeProducts.forEach(p => {
      totalInventoryValue += (p.sellingPrice * p.quantity);
    });

    res.json({
      totalProducts,
      outOfStock,
      lowStock,
      totalInventoryValue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addProduct, getProducts, updateProduct, deleteProduct, updateProductStatus, updateProductQuantity, getProductStats };
