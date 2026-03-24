const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const MovementLog = require('./models/MovementLog');
const Product = require('./models/Product');

async function fixEdits() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
  console.log('Connected');
  
  const editLogs = await MovementLog.find({ reason: 'Edited', quantityMoved: 0 });
  console.log(`Found ${editLogs.length} edited logs with 0 quantity.`);
  
  let patchedCount = 0;
  for (let log of editLogs) {
    const product = await Product.findById(log.product);
    if (product) {
       log.quantityMoved = product.quantity;
       await log.save();
       patchedCount++;
    }
  }
  
  console.log(`Successfully patched ${patchedCount} edited logs.`);
  process.exit();
}

fixEdits();
