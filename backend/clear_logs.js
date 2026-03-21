const mongoose = require('mongoose');
const MovementLog = require('./models/MovementLog');
require('dotenv').config();

const clearLogs = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_system';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB...');
    
    const result = await MovementLog.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} movement logs.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error clearing logs:', error);
    process.exit(1);
  }
};

clearLogs();
