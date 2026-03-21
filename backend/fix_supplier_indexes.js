const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
if (!process.env.MONGO_URI) {
    dotenv.config({ path: path.join(__dirname, '.env') });
}

async function fixIndexes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('suppliers');
        
        console.log('Dropping index name_1...');
        try {
            await collection.dropIndex('name_1');
            console.log('Successfully dropped name_1 index.');
        } catch (e) {
            console.log('Index name_1 not found or already dropped.');
        }

        const indexes = await collection.indexes();
        console.log('\nCurrent indexes for suppliers:');
        console.log(JSON.stringify(indexes, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

fixIndexes();
