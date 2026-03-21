const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');
const { getProductStats } = require('./controllers/productController');

async function verifyFix() {
  try {
    const mongoUri = 'mongodb://localhost:27017/inventory_system';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Simulate request/response objects
    const req = {
      user: {
        shopName: 'Shriji kirayana store'
      }
    };
    
    let responseData = null;
    const res = {
      json: (data) => {
        responseData = data;
      },
      status: (code) => {
        console.log('Status set to:', code);
        return res;
      }
    };

    await getProductStats(req, res);
    
    if (responseData) {
      console.log('Verification successful! Data returned:', responseData);
    } else {
      console.error('Verification failed: No data returned');
    }

    process.exit(0);
  } catch (err) {
    console.error('Verification failed with error:', err);
    process.exit(1);
  }
}

verifyFix();
