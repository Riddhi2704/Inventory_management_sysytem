const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
    console.log('Connected to DB');

    const targetShop = "Shriji kirayana store";
    const shopFilter = { shopName: { $regex: new RegExp(`^${targetShop}$`, 'i') } };

    console.log(`\n--- Searching for Shop: [${targetShop}] ---`);

    const products = await Product.find(shopFilter).populate('category supplier');
    console.log(`Products Found: ${products.length}`);
    products.forEach(p => {
        console.log(` - Product: ${p.name}, SKU: ${p.productId}, Status: ${p.status}, Cat: ${p.category?.name || 'MISSING'}, Sup: ${p.supplier?.name || 'MISSING'}`);
    });

    const categories = await Category.find(shopFilter);
    console.log(`Categories Found: ${categories.length}`);
    categories.forEach(c => console.log(` - Category: ${c.name}`));

    const suppliers = await Supplier.find(shopFilter);
    console.log(`Suppliers Found: ${suppliers.length}`);
    suppliers.forEach(s => console.log(` - Supplier: ${s.name}`));

    // Check all unique shop names in DB
    const allShops = await Product.distinct('shopName');
    console.log(`\nAll Unique Shop Names in Products: ${JSON.stringify(allShops)}`);

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

run();
