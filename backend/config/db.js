
import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error("MONGO_URL environment variable is missing");
  }

  const conn = await mongoose.connect(mongoUrl);

  console.log(`MongoDB Connected: ${conn.connection.host}`);
  return conn.connection;
};

export default connectDB;
