import mongoose from 'mongoose';
import { Config } from '../utils/constants.js';

const connectDB = async () => {
  if (!Config.MONGO_URI) {
    throw new Error('MongoDB URI is not configured');
  }

  try {
    await mongoose.connect(Config.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('MongoDB connected');
    return mongoose.connection;
  } catch (error) {
    throw new Error('MongoDB connection failed: ' + error.message);
  }
};

export default connectDB;
