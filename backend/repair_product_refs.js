const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
if (!process.env.MONGO_URI) {
    dotenv.config({ path: path.join(__dirname, '.env') });
}

const Product = require('./models/Product');
const Category = require('./models/Category');

async function repair() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        console.log(`Checking ${products.length} products...`);

        const categories = await Category.find({});
        const groceryCat = categories.find(c => c.name.toLowerCase() === 'grocery');
        const foodsCat = categories.find(c => c.name.toLowerCase() === 'foods');
        const stationaryCat = categories.find(c => c.name.toLowerCase() === 'stationary');
        const clothingCat = categories.find(c => c.name.toLowerCase() === 'clothing');
        const beautyCat = categories.find(c => c.name.toLowerCase().includes('beauty'));

        for (let p of products) {
            let changed = false;

            // 1. Fix shopName
            if (!p.shopName || p.shopName === 'undefined') {
                p.shopName = 'Shriji kirayana store';
                changed = true;
                console.log(`Product [${p.name}]: Fixed shopName`);
            }

            // 2. Fix category
            const existingCat = categories.find(c => c._id.toString() === p.category?.toString());
            if (!existingCat) {
                let name = p.name.toLowerCase();
                let newCat = groceryCat || categories[0];

                if (name.includes('wafer') || name.includes('biscuit') || name.includes('sugar') || name.includes('oil')) {
                    newCat = foodsCat || groceryCat || categories[0];
                } else if (name.includes('shampoo') || name.includes('soap') || name.includes('conditior')) {
                    newCat = beautyCat || groceryCat || categories[0];
                } else if (name.includes('tshirt')) {
                    newCat = clothingCat || groceryCat || categories[0];
                }

                p.category = newCat._id;
                changed = true;
                console.log(`Product [${p.name}]: Assigned category [${newCat.name}]`);
            }

            if (changed) {
                await p.save();
            }
        }

        console.log('Repair complete!');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

repair();
