const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 0 },
  unitType: { type: String, required: true, default: 'pcs' },
  description: { type: String },
  storageLocation: { type: String }, // shop / rack / Warehouse section
  shopName: { type: String, required: true },
  productImage: { type: String },
  
  status: { type: String, enum: ['Pending Approval', 'Active', 'Rejected'], default: 'Pending Approval' },
  minStockLevel: { type: Number, default: 50 },
  
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
