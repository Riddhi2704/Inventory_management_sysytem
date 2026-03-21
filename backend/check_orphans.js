const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./models/Product');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');

async function checkDataIntegrity() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const shopName = 'Shriji kirayana store';
    
    // 1. Direct products check
    const products = await Product.find({ shopName: { $regex: shopName, $options: 'i' } });
    console.log(`Total Products for "${shopName}":`, products.length);
    
    // 2. Aggregation check (exactly what the controller does)
    const shopFilter = { shopName: { $regex: shopName, $options: 'i' } };
    const categoryStats = await Product.aggregate([
      { $match: shopFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryInfo' } },
      { $unwind: '$categoryInfo' },
      { $project: { name: '$categoryInfo.name', count: 1 } }
    ]);
    
    console.log('Aggregation Category Stats:', JSON.stringify(categoryStats, null, 2));

    const supplierStats = await Product.aggregate([
      { $match: shopFilter },
      { $group: { _id: '$supplier', count: { $sum: 1 } } },
      { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 'supplierInfo' } },
      { $unwind: '$supplierInfo' },
      { $project: { name: '$supplierInfo.name', count: 1 } }
    ]);
    console.log('Aggregation Supplier Stats:', JSON.stringify(supplierStats, null, 2));

    // 3. Find Orphans
    for (const p of products) {
      const cat = await Category.findById(p.category);
      const sup = await Supplier.findById(p.supplier);
      if (!cat || !sup) {
        console.log(`ORPHAN FOUND: Product "${p.name}" has Category: ${cat ? 'OK' : 'MISSING (' + p.category + ')'}, Supplier: ${sup ? 'OK' : 'MISSING (' + p.supplier + ')'}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDataIntegrity();
