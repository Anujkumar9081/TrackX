const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/signupdb";

    await mongoose.connect(mongoUri);
    console.log(` MongoDB Connected to database: ${mongoose.connection.name}`);
  } catch (error) {
    console.warn(`Primary MongoDB Connection failed: ${error.message}`);
    // Fallback to local default if cloud URI had network/auth issue
    try {
      await mongoose.connect("mongodb://localhost:27017/signupdb");
      console.log(" Fallback MongoDB Connected on localhost:27017");
    } catch (fallbackError) {
      console.error("❌ MongoDB Connection Error:", fallbackError.message);
    }
  }
};

module.exports = connectDB;
