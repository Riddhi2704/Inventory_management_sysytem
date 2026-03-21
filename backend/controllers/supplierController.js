const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
  try {
    const shopName = req.user.shopName?.trim();
    if (!shopName) {
      return res.status(400).json({ message: 'Shop name not found' });
    }
    const safeShopName = shopName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const shopFilter = { shopName: { $regex: new RegExp(`^${safeShopName}$`, 'i') } };
    const suppliers = await Supplier.find(shopFilter);
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a supplier
// @route   POST /api/suppliers
// @access  Private (Manager, Admin)
const createSupplier = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    const shopName = req.user.shopName;

    // Phone validation
    if (phone && phone.replace(/\D/g, '').length !== 10) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    const supplierExists = await Supplier.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }, 
      shopName 
    });
    
    if (supplierExists) {
      return res.status(400).json({ message: 'Supplier already exists in your shop (case-insensitive)' });
    }

    const supplier = await Supplier.create({ name, phone, email, address, shopName });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Manager, Admin)
const updateSupplier = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    const shopName = req.user.shopName;

    // Phone validation
    if (phone && phone.replace(/\D/g, '').length !== 10) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    const supplier = await Supplier.findOne({ _id: req.params.id, shopName });

    if (supplier) {
      supplier.name = name || supplier.name;
      supplier.phone = phone || supplier.phone;
      supplier.email = email || supplier.email;
      supplier.address = address || supplier.address;

      const updatedSupplier = await supplier.save();
      res.json(updatedSupplier);
    } else {
       res.status(404).json({ message: 'Supplier not found or access denied' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Manager, Admin)
const deleteSupplier = async (req, res) => {
  try {
    const shopName = req.user.shopName;
    const supplier = await Supplier.findOne({ _id: req.params.id, shopName });
    if (supplier) {
      await supplier.deleteOne();
      res.json({ message: 'Supplier removed' });
    } else {
      res.status(404).json({ message: 'Supplier not found or access denied' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSuppliers, createSupplier, updateSupplier, deleteSupplier };
