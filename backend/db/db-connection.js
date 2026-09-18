import mongoose from 'mongoose';
import { Config } from '../utils/constants.js';
const connectDB = async () => {
  try {
    await mongoose.connect(Config.MONGO_URI);
    console.log('✔ MongoDB connected');
  } catch (error) {
    console.log('❌ MongoDB  connection error', error);
    process.exit(1);
  }
};

export default connectDB;

