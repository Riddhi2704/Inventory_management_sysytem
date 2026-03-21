const mongoose = require('mongoose');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');

async function migrate() {
  try {
    await mongoose.connect('mongodb://localhost:27017/inventory_system');
    console.log('Connected to MongoDB');

    const shopName = 'Shriji kirayana store';

    // Migrate Categories
    const catResult = await Category.updateMany(
      { shopName: { $exists: false } },
      { $set: { shopName } }
    );
    console.log(`Updated ${catResult.modifiedCount} categories with shopName: ${shopName}`);

    // Some might have empty strings if the model validation didn't catch it
    const catResult2 = await Category.updateMany(
      { shopName: '' },
      { $set: { shopName } }
    );
    console.log(`Updated ${catResult2.modifiedCount} empty shopName categories.`);

    // Migrate Suppliers
    const supResult = await Supplier.updateMany(
      { shopName: { $exists: false } },
      { $set: { shopName } }
    );
    console.log(`Updated ${supResult.modifiedCount} suppliers with shopName: ${shopName}`);

    const supResult2 = await Supplier.updateMany(
      { shopName: '' },
      { $set: { shopName } }
    );
    console.log(`Updated ${supResult2.modifiedCount} empty shopName suppliers.`);

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
