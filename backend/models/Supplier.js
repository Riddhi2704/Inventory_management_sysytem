const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  shopName: { type: String, required: true }
}, { timestamps: true });

// Ensure uniqueness per shop
supplierSchema.index({ name: 1, shopName: 1 }, { unique: true });

module.exports = mongoose.model('Supplier', supplierSchema);
