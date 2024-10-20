const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MongoDB_url);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
}

module.exports = connectDB;
