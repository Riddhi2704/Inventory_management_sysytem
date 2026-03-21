const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./models/Product');

async function checkSupplierField() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check the raw supplier field for a few products 
    const products = await Product.find({ shopName: /Shriji kirayana store/i }).select('name supplier').lean();
    
    console.log('Raw product supplier field values:');
    products.forEach(p => {
      console.log(`- ${p.name}: supplier = "${p.supplier}" (type: ${typeof p.supplier})`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkSupplierField();
