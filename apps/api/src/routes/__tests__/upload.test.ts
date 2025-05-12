import request from 'supertest';
import app from '../../server';
import { User, Course, TeeTime, UploadBatch } from '@golf-app/common';
import jwt from 'jsonwebtoken';
import { authConfig } from '../../config/auth';
import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB } from '../../test/setup';

describe('Upload Routes', () => {
  let adminUser: { _id: mongoose.Types.ObjectId };
  let adminToken: string;

  // Add valid ObjectIds for test courses
  const courseId1 = new mongoose.Types.ObjectId().toHexString();
  const courseId2 = new mongoose.Types.ObjectId().toHexString();
  const courseId3 = new mongoose.Types.ObjectId().toHexString();

  beforeAll(async () => {
    await setupTestDB();
  }, 30000); // Increase timeout for setup

  afterAll(async () => {
    await teardownTestDB();
  }, 10000); // Add timeout for teardown

  beforeEach(async () => {
    // Create admin user
    adminUser = await User.create({
      email: 'admin@example.com',
      name: 'Admin User',
      isAdmin: true,
    });

    adminToken = jwt.sign({ id: adminUser._id }, authConfig.jwtSecret, { expiresIn: '1y' });

    // Clear collections
    await Course.deleteMany({});
    await TeeTime.deleteMany({});
    await UploadBatch.deleteMany({});
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Course.deleteMany({});
    await TeeTime.deleteMany({});
    await UploadBatch.deleteMany({});
  });

  const createTestCsv = (rows: string[]) => {
    const headers = 'courseId,courseName,teeTime,holes,pricePerPlayer,availableSlots,bookingUrl,address,timeZone\n';
    return headers + rows.join('\n');
  };

  it('should require authentication', async () => {
    const response = await request(app)
      .post('/admin/upload')
      .attach('file', Buffer.from('test'), 'test.csv');

    expect(response.status).toBe(401);
  });

  it('should require admin access', async () => {
    const regularUser = await User.create({
      email: 'user@example.com',
      name: 'Regular User',
      isAdmin: false,
    });

    const token = jwt.sign({ id: regularUser._id }, authConfig.jwtSecret, { expiresIn: '1y' });

    const response = await request(app)
      .post('/admin/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('test'), 'test.csv');

    expect(response.status).toBe(403);
  });

  it('should process valid CSV file successfully', async () => {
    const csv = createTestCsv([
      `${courseId1},Course One,2024-04-01T10:00:00Z,18,50,4,http://course1.com,123 Course St,America/New_York`,
      `${courseId2},Course Two,2024-04-01T11:00:00Z,9,30,2,http://course2.com,456 Course Ave,America/New_York`,
      `${courseId3},Course Three,2024-04-01T12:00:00Z,18,75,4,http://course3.com,789 Course Rd,America/New_York`,
    ]);

    const response = await request(app)
      .post('/admin/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from(csv), 'test.csv');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.batch.importedCount).toBe(3);
    expect(response.body.batch.skippedCount).toBe(0);
    expect(response.body.batch.validationErrors).toHaveLength(0);

    // Verify courses were created
    const courses = await Course.find();
    expect(courses).toHaveLength(3);

    // Verify tee times were created
    const teeTimes = await TeeTime.find();
    expect(teeTimes).toHaveLength(3);
  });

  it('should skip malformed rows', async () => {
    const csv = createTestCsv([
      `${courseId1},Course One,2024-04-01T10:00:00Z,18,50,4,http://course1.com,123 Course St,America/New_York`,
      'invalid-row',
      `${courseId2},Course Two,2024-04-01T11:00:00Z,9,30,2,http://course2.com,456 Course Ave,America/New_York`,
    ]);

    const response = await request(app)
      .post('/admin/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from(csv), 'test.csv');

    expect(response.status).toBe(200);
    expect(response.body.batch.importedCount).toBe(2);
    expect(response.body.batch.skippedCount).toBe(1);
    expect(response.body.batch.validationErrors).toHaveLength(1);
  });

  it('should deduplicate identical rows', async () => {
    const csv = createTestCsv([
      `${courseId1},Course One,2024-04-01T10:00:00Z,18,50,4,http://course1.com,123 Course St,America/New_York`,
      `${courseId1},Course One,2024-04-01T10:00:00Z,18,50,4,http://course1.com,123 Course St,America/New_York`, // Duplicate
      `${courseId2},Course Two,2024-04-01T11:00:00Z,9,30,2,http://course2.com,456 Course Ave,America/New_York`,
    ]);

    const response = await request(app)
      .post('/admin/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from(csv), 'test.csv');

    expect(response.status).toBe(200);
    expect(response.body.batch.importedCount).toBe(2);
    expect(response.body.batch.skippedCount).toBe(0);

    // Verify only one tee time per course+time
    const teeTimes = await TeeTime.find();
    expect(teeTimes).toHaveLength(2);
  });
}); 