const mongoose = require('mongoose');
const MovementLog = require('./models/MovementLog');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');

async function debug() {
  try {
    const mongoUri = 'mongodb://localhost:27017/inventory_system';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const logs = await MovementLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'product',
        populate: [
          { path: 'category' },
          { path: 'supplier' }
        ]
      });

    console.log('Logs structure:', JSON.stringify(logs, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

debug();
