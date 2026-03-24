const mongoose = require('mongoose');

const movementLogSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantityMoved: { type: Number, required: true },
  fromLocation: { type: String },
  toLocation: { type: String },
  movedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String }, // e.g., 'Restock', 'Store display', 'Damage', 'Return'
  shopName: { type: String, required: true },
  productName: { type: String },
  categoryName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MovementLog', movementLogSchema);
