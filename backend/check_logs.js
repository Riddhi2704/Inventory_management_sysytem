const mongoose = require('mongoose');
const MovementLog = require('./models/MovementLog');

async function checkLogs() {
  try {
    await mongoose.connect('mongodb://localhost:27017/inventory_system');
    const logs = await MovementLog.find({}).populate('product', 'name').sort({ createdAt: -1 }).limit(10);
    console.log('Recent Movement Logs (latest 10):');
    logs.forEach(l => {
      console.log(`- Product: ${l.product?.name || 'N/A'}, Reason: "${l.reason}", Date: ${l.createdAt}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkLogs();
