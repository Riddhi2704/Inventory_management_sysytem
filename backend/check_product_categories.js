const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
if (!process.env.MONGO_URI) {
    dotenv.config({ path: path.join(__dirname, '.env') });
}

const Product = require('./models/Product');
const Category = require('./models/Category');

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({}).populate('category', 'name');
        console.log(`Total Products: ${products.length}`);

        products.forEach(p => {
            console.log(`Product: [${p.name}], Category Reference: [${p.category ? p.category.name : 'NULL/MISSING'}]`);
            if (!p.category) {
                console.log(`  -> RAW Category ID: ${p.get('category', null, {getters: false})}`);
            }
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkProducts();
