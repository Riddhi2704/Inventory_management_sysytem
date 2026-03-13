const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({});
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
    const { name, contactPerson, phone, email, address } = req.body;
    const supplierExists = await Supplier.findOne({ name });
    
    if (supplierExists) {
      return res.status(400).json({ message: 'Supplier already exists' });
    }

    const supplier = await Supplier.create({ name, contactPerson, phone, email, address });
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
    const { name, contactPerson, phone, email, address } = req.body;
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
      supplier.name = name || supplier.name;
      supplier.contactPerson = contactPerson || supplier.contactPerson;
      supplier.phone = phone || supplier.phone;
      supplier.email = email || supplier.email;
      supplier.address = address || supplier.address;

      const updatedSupplier = await supplier.save();
      res.json(updatedSupplier);
    } else {
       res.status(404).json({ message: 'Supplier not found' });
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
    const supplier = await Supplier.findById(req.params.id);
    if (supplier) {
      await supplier.deleteOne();
      res.json({ message: 'Supplier removed' });
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSuppliers, createSupplier, updateSupplier, deleteSupplier };
