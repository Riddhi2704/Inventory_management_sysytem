const mongoose = require('mongoose');
const Product = require('./models/Product');
const MovementLog = require('./models/MovementLog');
const User = require('./models/User');
require('dotenv').config();

async function seedAnalytics() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
    console.log('Connected to MongoDB');

    const shopName = "Shriji kirayana store";
    const user = await User.findOne({ shopName, role: 'Manager' });
    if (!user) {
      console.error('Manager not found for this shop');
      process.exit(1);
    }

    const products = await Product.find({ shopName, status: 'Active' });
    if (products.length === 0) {
      console.error('No active products found for this shop');
      process.exit(1);
    }

    console.log(`Seeding data for ${products.length} products...`);

    const reasons = ['Sale', 'Restock', 'Damage', 'Used'];
    const logs = [];

    // Create logs for the last 10 days
    for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        products.forEach(p => {
            // Random sale
            logs.push({
                product: p._id,
                quantityMoved: Math.floor(Math.random() * 10) + 1,
                movedBy: user._id,
                reason: 'Sale',
                shopName,
                createdAt: date
            });

            // Random restock sometimes
            if (Math.random() > 0.7) {
                logs.push({
                    product: p._id,
                    quantityMoved: Math.floor(Math.random() * 50) + 10,
                    movedBy: user._id,
                    reason: 'Restock',
                    shopName,
                    createdAt: date
                });
            }
        });
    }

    await MovementLog.insertMany(logs);
    console.log(`Successfully seeded ${logs.length} movement logs.`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
seedAnalytics();
