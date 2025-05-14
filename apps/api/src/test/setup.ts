import { setupTestDB, clearTestDB, teardownTestDB } from '@golf-app/common/src/test/setup';
import { User, IUser } from '@golf-app/common';
import jwt from 'jsonwebtoken';
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

// Global test variables
export let testUser: IUser & mongoose.Document;
export let testAdminUser: IUser & mongoose.Document;
export let testUserToken: string;
export let testAdminToken: string;

beforeAll(async () => {
  try {
    // Set up test database
    await setupTestDB();

    // Create test users
    testUser = await User.create({
      email: 'test@example.com',
      name: 'Test User',
    });

    testAdminUser = await User.create({
      email: 'admin@example.com',
      name: 'Admin User',
      isAdmin: true,
    });

    // Generate tokens
    testUserToken = jwt.sign(
      { id: testUser._id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    testAdminToken = jwt.sign(
      { id: testAdminUser._id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Verify users were created
    const foundUser = await User.findById(testUser._id);
    const foundAdmin = await User.findById(testAdminUser._id);

    if (!foundUser || !foundAdmin) {
      throw new Error('Failed to create test users');
    }
  } catch (error) {
    console.error('Error in test setup:', error);
    throw error;
  }
}, 30000);

afterEach(async () => {
  try {
    // Clear any test data that might have been created during tests
    await clearTestDB();
  } catch (error) {
    console.error('Error in test cleanup:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    // Clean up test users
    if (testUser) await User.findByIdAndDelete(testUser._id);
    if (testAdminUser) await User.findByIdAndDelete(testAdminUser._id);
    await teardownTestDB();
  } catch (error) {
    console.error('Error in final cleanup:', error);
    throw error;
  }
}, 30000); 