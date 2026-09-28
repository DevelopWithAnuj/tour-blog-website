import mongoose from 'mongoose';
import { Config } from '../utils/constants.js';
import logger from '../config/logger.js';

let listenersAttached = false;

const attachListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;
  const c = mongoose.connection;
  c.on('disconnected', () => logger.warn('MongoDB disconnected'));
  c.on('reconnected', () => logger.info('MongoDB reconnected'));
  c.on('error', (err) => logger.error(`MongoDB error: ${err.message}`));
};

const connectDB = async () => {
  if (!Config.MONGO_URI) throw new Error('MongoDB URI is not configured');
  attachListeners()

  try {
    await mongoose.connect(Config.MONGO_URI, {
      serverSelectionTimeoutMS: 15000, // 5s is too tight for flaky networks
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
      family: 4, // force IPv4; avoids IPv6/DNS hangs on some ISPs
    });
logger.info('MongoDB connected');
    return mongoose.connection;
  } catch (error) {
    throw new Error('MongoDB connection failed: ' + error.message);
  }
};

export default connectDB;
