import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from '@golf-app/common';
import { Application } from 'express';

let app: Application;
let Course: typeof import('@golf-app/common').Course;
let TeeTime: typeof import('@golf-app/common').TeeTime;
let UploadBatch: typeof import('@golf-app/common').UploadBatch;
let testAdminUser: any;
let testAdminToken: string;

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-min-32-chars-long';

describe('Upload Routes', () => {
  // Add valid ObjectIds for test courses
  const courseId1 = new mongoose.Types.ObjectId().toHexString();
  const courseId2 = new mongoose.Types.ObjectId().toHexString();
  const courseId3 = new mongoose.Types.ObjectId().toHexString();

  beforeEach(async () => {
    // Clear users and courses
    await User.deleteMany({});
    Course = require('@golf-app/common').Course;
    TeeTime = require('@golf-app/common').TeeTime;
    UploadBatch = require('@golf-app/common').UploadBatch;
    await Course.deleteMany({});
    await TeeTime.deleteMany({});
    await UploadBatch.deleteMany({});

    // Create admin user
    testAdminUser = await User.create({
      email: 'admin@example.com',
      name: 'Admin User',
      isAdmin: true,
    });
    testAdminToken = jwt.sign({ id: testAdminUser._id }, JWT_SECRET, { expiresIn: '1h' });

    // Create test courses
    await Course.insertMany([
      {
        _id: courseId1,
        name: 'Test Course 1',
        bookingUrl: 'https://example.com/book1',
        address: '123 Golf St, Test City',
        holes: 18,
        timeZone: 'America/New_York',
      },
      {
        _id: courseId2,
        name: 'Test Course 2',
        bookingUrl: 'https://example.com/book2',
        address: '456 Golf St, Test City',
        holes: 18,
        timeZone: 'America/New_York',
      },
      {
        _id: courseId3,
        name: 'Test Course 3',
        bookingUrl: 'https://example.com/book3',
        address: '789 Golf St, Test City',
        holes: 18,
        timeZone: 'America/New_York',
      },
    ]);

    // Import the app after data creation and after users are created
    const { createApp } = require('../../server');
    app = createApp();
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .post('/admin/upload')
      .attach('file', Buffer.from('test'), 'test.csv');

    expect(response.status).toBe(401);
  });

  it('should require admin access', async () => {
    const response = await request(app)
      .post('/admin/upload')
      .set('Authorization', 'Bearer invalid-token')
      .attach('file', Buffer.from('test'), 'test.csv');

    expect(response.status).toBe(401);
  });

  it('should process valid CSV file successfully', async () => {
    const csv = `courseId,courseName,teeTime,holes,pricePerPlayer,availableSlots,bookingUrl,address,timeZone
${courseId1},Test Course 1,2024-04-01T10:00:00Z,18,50,4,https://example.com/book1,"123 Golf St, Test City",America/New_York
${courseId2},Test Course 2,2024-04-01T11:00:00Z,18,75,2,https://example.com/book2,"456 Golf St, Test City",America/New_York
${courseId3},Test Course 3,2024-04-01T12:00:00Z,18,100,1,https://example.com/book3,"789 Golf St, Test City",America/New_York`;

    const response = await request(app)
      .post('/admin/upload')
      .set('Authorization', `Bearer ${testAdminToken}`)
      .attach('file', Buffer.from(csv), 'test.csv');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.batch.importedCount).toBe(3);
    expect(response.body.batch.skippedCount).toBe(0);
  });

  it('should skip malformed rows', async () => {
    const csv = `courseId,courseName,teeTime,holes,pricePerPlayer,availableSlots,bookingUrl,address,timeZone
${courseId1},Test Course 1,2024-04-01T10:00:00Z,18,50,4,https://example.com/book1,"123 Golf St, Test City",America/New_York
invalid-id,Invalid Course,invalid-date,invalid-holes,invalid-price,invalid-slots,https://example.com/bookX,"Invalid Address",America/New_York
${courseId2},Test Course 2,2024-04-01T11:00:00Z,18,75,2,https://example.com/book2,"456 Golf St, Test City",America/New_York`;

    const response = await request(app)
      .post('/admin/upload')
      .set('Authorization', `Bearer ${testAdminToken}`)
      .attach('file', Buffer.from(csv), 'test.csv');

    expect(response.status).toBe(200);
    expect(response.body.batch.importedCount).toBe(2);
    expect(response.body.batch.skippedCount).toBe(1);
    expect(response.body.batch.validationErrors).toHaveLength(1);
  });

  it('should deduplicate identical rows', async () => {
    const csv = `courseId,courseName,teeTime,holes,pricePerPlayer,availableSlots,bookingUrl,address,timeZone
${courseId1},Test Course 1,2024-04-01T10:00:00Z,18,50,4,https://example.com/book1,"123 Golf St, Test City",America/New_York
${courseId1},Test Course 1,2024-04-01T10:00:00Z,18,50,4,https://example.com/book1,"123 Golf St, Test City",America/New_York
${courseId2},Test Course 2,2024-04-01T11:00:00Z,18,75,2,https://example.com/book2,"456 Golf St, Test City",America/New_York`;

    const response = await request(app)
      .post('/admin/upload')
      .set('Authorization', `Bearer ${testAdminToken}`)
      .attach('file', Buffer.from(csv), 'test.csv');

    expect(response.status).toBe(200);
    expect(response.body.batch.importedCount).toBe(2);
    expect(response.body.batch.skippedCount).toBe(1);
  });
}); 