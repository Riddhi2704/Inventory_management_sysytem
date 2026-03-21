const mongoose = require('mongoose');
const Supplier = require('./models/Supplier');
const Product = require('./models/Product');
const Category = require('./models/Category');
require('dotenv').config();

async function setupTestData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
    
    // Create Category - Use a more unique name or find existing
    let categoryName = 'Test Category ' + Math.floor(Math.random() * 1000);
    let category = await Category.findOne({ name: 'Test Category' }); // Try to reuse one first
    if (!category) {
      category = await Category.create({ name: 'Test Category' });
    }

    // Create Supplier
    let supplier = await Supplier.findOne({ name: 'Test Supplier', shopName: 'Test Shop' });
    if (!supplier) {
      supplier = await Supplier.create({
        name: 'Test Supplier',
        contactPerson: 'Supplier Person',
        email: 'supplier@example.com',
        phone: '1234567890',
        address: 'Supplier Address',
        shopName: 'Test Shop'
      });
    }

    // Create Product
    let product = await Product.findOne({ name: 'Test Product', shopName: 'Test Shop' });
    if (!product) {
      product = await Product.create({
        productId: 'PROD-TEST-' + Math.floor(Math.random() * 10000),
        name: 'Test Product',
        category: category._id,
        supplier: supplier._id,
        quantity: 100,
        purchasePrice: 10,
        sellingPrice: 15,
        unitType: 'pcs',
        status: 'Active',
        shopName: 'Test Shop'
      });
    }

    console.log('Test data setup complete: Supplier:', supplier.name, 'Product:', product.name);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setupTestData();
