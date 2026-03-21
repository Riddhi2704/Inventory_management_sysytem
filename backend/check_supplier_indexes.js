const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
if (!process.env.MONGO_URI) {
    dotenv.config({ path: path.join(__dirname, '.env') });
}

async function checkIndexes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('suppliers');
        const indexes = await collection.indexes();
        console.log('Indexes for suppliers collection:');
        console.log(JSON.stringify(indexes, null, 2));

        const suppliers = await collection.find({}).toArray();
        console.log(`\nTotal Suppliers: ${suppliers.length}`);
        suppliers.forEach(s => {
            console.log(`- [${s.name}] in Shop: [${s.shopName}]`);
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkIndexes();
