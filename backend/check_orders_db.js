const mongoose = require('mongoose');
require('dotenv').config();

const PurchaseOrder = require('./models/PurchaseOrder');
const Supplier = require('./models/Supplier');

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system');
    console.log('Connected to MongoDB');

    const orders = await PurchaseOrder.find().populate('supplier', 'name');
    console.log('Total Orders:', orders.length);
    orders.forEach(order => {
      console.log(`Order ID: ${order.orderId}, Shop: ${order.shopName}, Supplier: ${order.supplier?.name}, Total: ${order.totalAmount}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkOrders();
