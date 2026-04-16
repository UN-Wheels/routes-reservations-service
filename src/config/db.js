const mongoose = require("mongoose");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const maxAttempts = 10;

  if (!mongoUri) {
    console.error("MONGO_URI is not set");
    process.exit(1);
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(mongoUri);
      console.log("MongoDB connected");
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed`, err.message);

      if (attempt === maxAttempts) {
        process.exit(1);
      }

      await sleep(2000);
    }
  }
};

module.exports = connectDB;