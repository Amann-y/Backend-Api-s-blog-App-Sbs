const mongoose = require("mongoose");

const connectDB = async (url) => {
  try {
    // Attempt to connect to MongoDB using Mongoose
    await mongoose.connect(url);

    console.log("MongoDB connected successfully");
  } catch (error) {
    if (error instanceof mongoose.Error) {
      // Handle Mongoose-specific errors
      console.error("Mongoose error:", error.message);
    } else if (error.name === "MongoNetworkError") {
      // Handle network-related errors
      console.error("Network error:", error.message);
    } else if (error.name === "MongoParseError") {
      // Handle URI parsing errors
      console.error("URI parse error:", error.message);
    } else {
      // Handle any other errors
      console.error("Unknown error:", error.message);
    }

    // Exit the process with failure code
    process.exit(1);
  }

  // Set up event listeners for Mongoose connection events
  mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose connection disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("Mongoose connection reconnected");
  });
};

module.exports = { connectDB };
