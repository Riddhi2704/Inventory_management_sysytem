const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });
if (!process.env.MONGO_URI) {
    // Try current dir if above failed
    dotenv.config({ path: path.join(__dirname, '.env') });
}

// Fixed paths relative to THIS file (which is in backend/)
const User = require('./models/User');
const Category = require('./models/Category');

async function diagnose() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const staffEmail = 'teststaff@example.com';
        const user = await User.findOne({ email: staffEmail });

        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        const shopNameFromUser = user.shopName;
        console.log(`Staff User ShopName: [${shopNameFromUser}] (Length: ${shopNameFromUser.length})`);
        
        // Hex dump
        console.log('Hex User ShopName:', Buffer.from(shopNameFromUser).toString('hex'));

        const categories = await Category.find({});
        console.log(`Total categories in DB: ${categories.length}`);

        const matchedCategories = categories.filter(c => {
            if (!c.shopName) return false;
            const match = new RegExp(shopNameFromUser, 'i').test(c.shopName);
            if (match) {
                console.log(`Matched Category: [${c.name}] with ShopName: [${c.shopName}] (Length: ${c.shopName.length})`);
                console.log('Hex Category ShopName:', Buffer.from(c.shopName).toString('hex'));
            }
            return match;
        });

        console.log(`Found ${matchedCategories.length} categories matching [${shopNameFromUser}]`);

        // Check if there are ANY categories for this shop without regex
        const exactMatches = await Category.find({ shopName: shopNameFromUser });
        console.log(`Found ${exactMatches.length} categories with EXACT shopName match`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

diagnose();
