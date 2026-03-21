const MovementLog = require('../models/MovementLog');
const Product = require('../models/Product');

// @desc    Get all movement logs
// @route   GET /api/logs/movement
// @access  Private (Manager, Admin)
const getMovementLogs = async (req, res) => {
  try {
    const shopName = req.user.shopName;
    const logs = await MovementLog.find({ shopName })
      .populate('product', 'name')
      .populate('movedBy', 'fullName role')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record product movement and update quantity
// @route   POST /api/logs/movement
// @access  Private (Staff, Manager, Admin)
const recordMovement = async (req, res) => {
  try {
    const { productId, quantityMoved, reason, toLocation, fromLocation, isReturnOrDamage } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
       return res.status(404).json({ message: 'Product not found' });
    }

    // Determine how this affects active stock
    let quantityChange = parseInt(quantityMoved);
    if (reason === 'Damage' || reason === 'Sent Out' || reason === 'Used' || reason === 'Sale') {
       quantityChange = -Math.abs(quantityChange); // Decrease stock
    } else if (reason === 'Restock' || reason === 'Return' || reason === 'Found') {
       quantityChange = Math.abs(quantityChange);  // Increase stock
    }

    // If it's a damage or return that doesn't go back into active stock perfectly, we might handle it differently later
    // For now, basic inventory math:
    if (product.quantity + quantityChange < 0) {
      return res.status(400).json({ message: 'Insufficient stock for this movement' });
    }

    product.quantity += quantityChange;
    await product.save();

    const log = await MovementLog.create({
      product: productId,
      quantityMoved: Math.abs(quantityMoved), // Log the absolute amount moved
      fromLocation,
      toLocation,
      movedBy: req.user.id,
      reason,
      shopName: req.user.shopName
    });

    res.status(201).json({ message: 'Movement recorded', log, updatedQuantity: product.quantity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMovementLogs, recordMovement };
