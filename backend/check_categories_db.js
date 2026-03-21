const mongoose = require('mongoose');
const Category = require('./models/Category');

async function checkCategories() {
  try {
    await mongoose.connect('mongodb://localhost:27017/inventory_system');
    console.log('Connected to MongoDB');

    const categories = await Category.find({});
    console.log('All Categories in DB:', categories.length);
    categories.forEach(c => {
      console.log(`- ID: ${c._id}, Name: ${c.name}, ShopName: ${c.shopName || 'MISSING'}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCategories();
