import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-min-32-chars-long';
process.env.JWT_EXPIRES_IN = '1h';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.APPLE_CLIENT_ID = 'test-apple-client-id';
process.env.APPLE_TEAM_ID = 'test-apple-team-id';
process.env.APPLE_KEY_ID = 'test-apple-key-id';
process.env.APPLE_PRIVATE_KEY = 'test-apple-private-key';
process.env.AUTH_CALLBACK_URL = 'http://localhost:3000/auth/callback';

let mongod: MongoMemoryServer;

// Track if we've already set up the connection
let isConnected = false;

export async function setupTestDB() {
  if (isConnected) {
    return;
  }

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Disconnect any existing connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(uri);
  isConnected = true;
}

export async function teardownTestDB() {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
  await mongod.stop();
  isConnected = false;
}

beforeAll(async () => {
  await setupTestDB();
}, 30000); // Increase timeout for setup

afterEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
}, 10000); // Add timeout for cleanup

afterAll(async () => {
  await teardownTestDB();
}, 10000); // Add timeout for teardown 