import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
  } catch (error) {
    console.error('Failed to set up MongoDB:', error);
    throw error;
  }
}, 60000);

afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error('Failed to tear down MongoDB:', error);
    throw error;
  }
}, 60000);

afterEach(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      await Promise.all(
        Object.values(collections).map(collection => collection.deleteMany({}))
      );
    }
  } catch (error) {
    console.error('Failed to clean up collections:', error);
    throw error;
  }
}); 