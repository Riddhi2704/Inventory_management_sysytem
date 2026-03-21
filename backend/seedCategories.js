const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });
if (!process.env.MONGO_URI) {
    dotenv.config({ path: path.join(__dirname, '.env') });
}

const Category = require('./models/Category');

const globalCategories = [
    { name: 'Electronic', description: 'Consumer electronics, gadgets, and devices' },
    { name: 'Clothing', description: 'Apparel, garments, and fashion items' },
    { name: 'Grocery', description: 'Food supplies, household essentials, and daily items' },
    { name: 'Home and Kitchen', description: 'Home decor, furniture, and kitchen appliances' },
    { name: 'Beauty and Personal Care', description: 'Skincare, makeup, and personal hygiene' },
    { name: 'Health and Medical', description: 'Medicines, supplements, and first aid' },
    { name: 'Stationary', description: 'Office supplies, writing tools, and paper products' },
    { name: 'Hardware', description: 'Tools, building materials, and home repair items' },
    { name: 'Sports and Fitness', description: 'Sports equipment, gym gear, and outdoor accessories' },
    { name: 'Toys and Baby Products', description: 'Children toys, games, and infant essentials' },
    { name: 'Automobile Accessories', description: 'Parts and accessories for vehicles' },
    { name: 'Books', description: 'Educational, fiction, and non-fiction books' },
    { name: 'Foods', description: 'Packaged foods, snacks, and prepared meals' }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing categories (Warning: This will clear ALL categories)
        console.log('Clearing existing categories...');
        await Category.deleteMany({});

        // Insert global categories
        console.log('Inserting global categories...');
        await Category.insertMany(globalCategories);

        console.log('Successfully seeded global categories!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
