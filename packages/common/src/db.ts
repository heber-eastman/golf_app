import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/golf-app';
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};

// Test-specific connection options
const testMongooseOptions = {
  ...mongooseOptions,
  serverSelectionTimeoutMS: 2000,
  connectTimeoutMS: 2000,
};

export async function connectDB(): Promise<void> {
  const isTest = process.env.NODE_ENV === 'test';
  const options = isTest ? testMongooseOptions : mongooseOptions;
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(MONGODB_URI, options);
      console.log('Connected to MongoDB');
      return;
    } catch (error) {
      retries++;
      if (retries === MAX_RETRIES) {
        console.error('Failed to connect to MongoDB after maximum retries:', error);
        throw error;
      }
      console.log(`Failed to connect to MongoDB. Retrying in ${RETRY_DELAY}ms... (Attempt ${retries}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Failed to disconnect from MongoDB:', error);
    throw error;
  }
} 