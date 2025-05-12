import request from 'supertest';
import app from '../../server';
import { Course, TeeTime } from '@golf-app/common';
import { setupTestDB, teardownTestDB } from '../../test/setup';

describe('Search Routes', () => {
  let course1: typeof Course.prototype;
  let course2: typeof Course.prototype;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  beforeAll(async () => {
    await setupTestDB();
  }, 30000); // Increase timeout for setup

  afterAll(async () => {
    await teardownTestDB();
  }, 10000); // Add timeout for teardown

  beforeEach(async () => {
    // Clear existing data
    await Course.deleteMany({});
    await TeeTime.deleteMany({});

    // Create test courses
    course1 = await Course.create({
      name: 'Test Course 1',
      bookingUrl: 'https://test1.com',
      address: '123 Test St',
      holes: 18,
      timeZone: 'America/Denver',
    });

    course2 = await Course.create({
      name: 'Test Course 2',
      bookingUrl: 'https://test2.com',
      address: '456 Test Ave',
      holes: 18,
      timeZone: 'America/Denver',
    });

    // Create test tee times
    const teeTimes: Array<Record<string, unknown>> = [
      {
        courseId: course1._id,
        teeTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM
        holes: 18,
        pricePerPlayer: 50,
        availableSlots: 4,
      },
      {
        courseId: course1._id,
        teeTime: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10 AM
        holes: 18,
        pricePerPlayer: 60,
        availableSlots: 2,
      },
      {
        courseId: course2._id,
        teeTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11 AM
        holes: 18,
        pricePerPlayer: 70,
        availableSlots: 3,
      },
    ];

    await TeeTime.insertMany(teeTimes);
  });

  afterEach(async () => {
    await Course.deleteMany({});
    await TeeTime.deleteMany({});
  });

  it('should return tee times for a given date', async () => {
    const response = await request(app)
      .get('/search')
      .query({ date: today.toISOString() });

    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(3);
    expect(response.body.total).toBe(3);
    expect(response.body.hasMore).toBe(false);
  });

  it('should filter by courseId', async () => {
    const response = await request(app)
      .get('/search')
      .query({ 
        date: today.toISOString(),
        courseId: course1._id.toString(),
      });

    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(2);
    expect(response.body.results.every((tt: unknown) => (tt as { courseId: string }).courseId === course1._id.toString())).toBe(true);
  });

  it('should filter by maxPrice', async () => {
    const response = await request(app)
      .get('/search')
      .query({ 
        date: today.toISOString(),
        maxPrice: '55',
      });

    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(1);
    expect(response.body.results[0].pricePerPlayer).toBe(50);
  });

  it('should filter by availableSlots', async () => {
    const response = await request(app)
      .get('/search')
      .query({ 
        date: today.toISOString(),
        slots: '4',
      });

    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(1);
    expect(response.body.results[0].availableSlots).toBe(4);
  });

  it('should filter by time range', async () => {
    const startTime = new Date(today.getTime() + 9 * 60 * 60 * 1000);
    const endTime = new Date(today.getTime() + 10 * 60 * 60 * 1000);

    const response = await request(app)
      .get('/search')
      .query({ 
        date: today.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(1);
    expect(new Date(response.body.results[0].teeTime).getHours()).toBe(9);
  });

  it('should handle pagination with cursor', async () => {
    // First page
    const response1 = await request(app)
      .get('/search')
      .query({ 
        date: today.toISOString(),
      });

    expect(response1.status).toBe(200);
    expect(response1.body.results).toHaveLength(3);
    expect(response1.body.hasMore).toBe(false);

    // Test with invalid cursor
    const response2 = await request(app)
      .get('/search')
      .query({ 
        date: today.toISOString(),
        cursor: 'invalid',
      });

    expect(response2.status).toBe(400);
  });

  it('should validate date parameter', async () => {
    const response = await request(app)
      .get('/search')
      .query({ date: 'invalid-date' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid search parameters');
  });
}); 