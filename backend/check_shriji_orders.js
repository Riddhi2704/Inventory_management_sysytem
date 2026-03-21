const mongoose = require('mongoose');
require('dotenv').config();

const PurchaseOrder = require('./models/PurchaseOrder');

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
    
    const shopName = 'Shriji kirayana store';
    const orders = await PurchaseOrder.find({ shopName: { $regex: new RegExp(`^${shopName}$`, 'i') } }).populate('supplier', 'name');
    
    console.log(`Orders for [${shopName}]:`, orders.length);
    orders.forEach(order => {
      console.log(`Order ID: ${order.orderId}, Supplier: ${order.supplier?.name}, Total: ${order.totalAmount}, Status: ${order.status}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkOrders();
