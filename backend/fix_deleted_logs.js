const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const MovementLog = require('./models/MovementLog');
const Product = require('./models/Product');

async function fixDeletedLogs() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
    console.log('Connected to DB');

    // Find all deletion logs that either have the old reason format or missing category
    const deletedLogs = await MovementLog.find({
      $or: [
        { reason: { $regex: /^Deleted:/ } },
        { reason: 'Deleted', categoryName: { $exists: false } }
      ]
    });

    console.log(`Found ${deletedLogs.length} deleted logs to patch.`);

    for (let log of deletedLogs) {
      let prodName = null;
      if (log.reason.startsWith('Deleted:')) {
        prodName = log.reason.split('Deleted:')[1].trim();
      }

      // Try to find previous logs for this exact product ID to infer category and quantity
      const prevLogs = await MovementLog.find({
        product: log.product,
        _id: { $ne: log._id },
        createdAt: { $lt: log.createdAt }
      }).sort({ createdAt: -1 });

      let inferredCategory = 'Unknown';
      let inferredQuantity = 0;
      let inferredUnit = 'pcs';

      if (prevLogs.length > 0) {
        // Look through previous logs. If any of them was populated or had category, 
        // wait, previous logs are just MovementLog. To get category, we'd need to have saved it.
        // If the Product is still in DB (soft delete maybe?), we can check:
        const prod = await Product.findById(log.product).populate('category');
        if (prod) {
          inferredCategory = prod.category ? prod.category.name : 'Unknown';
          inferredQuantity = prod.quantity;
          prodName = prodName || prod.name;
        } else {
          // If product is gone, we can't easily get category from older logs because MovementLog didn't store category historically!
          // But maybe we can guess quantity by summing up previous movements?
          // Restocks add, Sales subtract.
          let q = 0;
          for (let pLog of prevLogs.reverse()) {
            if (['Restock', 'Return', 'Found'].includes(pLog.reason)) q += pLog.quantityMoved;
            else if (['Sale', 'Damage', 'Used', 'Sent Out', 'Adjustment'].includes(pLog.reason)) q -= pLog.quantityMoved;
          }
          inferredQuantity = Math.max(0, q); // basic inference
        }
      }

      // Apply fix
      log.reason = 'Deleted'; // Normalize reason
      log.productName = prodName || 'Item Removed';
      log.categoryName = log.categoryName || inferredCategory;
      if (log.quantityMoved === 0 && inferredQuantity > 0) {
        log.quantityMoved = inferredQuantity;
      }
      
      await log.save();
      console.log(`Patched log ${log._id}: Name=${log.productName}, Qty=${log.quantityMoved}, Cat=${log.categoryName}`);
    }

    console.log('Done!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fixDeletedLogs();
