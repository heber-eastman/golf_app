import { connect, disconnect, connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export const setupTestDB = async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Disconnect any existing connection
    if (connection.readyState !== 0) {
      await disconnect();
    }

    // Connect to the new instance with increased timeout
    await connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
};

export const clearTestDB = async () => {
  try {
    if (connection.readyState !== 1) {
      // Not connected, skip clearing
      return;
    }
    const collections = connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Error clearing test data:', error);
    throw error;
  }
};

export const teardownTestDB = async () => {
  try {
    // Disconnect from MongoDB
    if (connection.readyState !== 0) {
      await disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error('Error during test teardown:', error);
    throw error;
  }
}; 