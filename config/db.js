// config/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
let MONGO_URI = process.env.mongo_db_url

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
};

module.exports = connectDB;
