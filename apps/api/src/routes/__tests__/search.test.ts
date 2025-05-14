import request from 'supertest';
import mongoose from 'mongoose';
import { Application } from 'express';

let app: Application;
let Course: typeof import('@golf-app/common').Course;
let TeeTime: typeof import('@golf-app/common').TeeTime;

describe('Search Routes', () => {
  let courseId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    Course = require('@golf-app/common').Course;
    TeeTime = require('@golf-app/common').TeeTime;
    // Create test course
    const course = await Course.create({
      name: 'Test Golf Course',
      bookingUrl: 'https://example.com/book',
      address: '123 Golf St, Test City',
      holes: 18,
      timeZone: 'America/New_York',
    });
    courseId = course._id;

    // Create test tee times
    const teeTimes = [
      {
        courseId: course._id,
        teeTime: new Date('2024-04-01T10:00:00Z'),
        holes: 18,
        pricePerPlayer: 50,
        availableSlots: 4,
      },
      {
        courseId: course._id,
        teeTime: new Date('2024-04-01T11:00:00Z'),
        holes: 18,
        pricePerPlayer: 75,
        availableSlots: 2,
      },
      {
        courseId: course._id,
        teeTime: new Date('2024-04-01T12:00:00Z'),
        holes: 18,
        pricePerPlayer: 100,
        availableSlots: 1,
      },
    ];

    await TeeTime.insertMany(teeTimes);

    // Import the app after data creation
    const { createApp } = require('../../server');
    app = createApp();
  });

  it('should return tee times for a given date', async () => {
    const response = await request(app)
      .get('/search')
      .query({ date: '2024-04-01T10:00:00Z' });

    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(3);
    expect(response.body.total).toBe(3);
    expect(response.body.hasMore).toBe(false);
  });

  it('should filter by courseId', async () => {
    const response = await request(app)
      .get('/search')
      .query({
        date: '2024-04-01T10:00:00Z',
        courseId: courseId.toString(),
      });

    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(3);
    expect(response.body.results[0].courseId.toString()).toBe(courseId.toString());
  });

  it('should filter by maxPrice', async () => {
    const response = await request(app)
      .get('/search')
      .query({
        date: '2024-04-01T10:00:00Z',
        maxPrice: 75,
      });

    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(2);
    expect(response.body.results[0].pricePerPlayer).toBeLessThanOrEqual(75);
  });

  it('should filter by availableSlots', async () => {
    const response = await request(app)
      .get('/search')
      .query({
        date: '2024-04-01T10:00:00Z',
        minSlots: 2,
      });

    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(2);
    expect(response.body.results[0].availableSlots).toBeGreaterThanOrEqual(2);
  });

  it('should filter by time range', async () => {
    const response = await request(app)
      .get('/search')
      .query({
        date: '2024-04-01T10:00:00Z',
        startTime: '2024-04-01T10:00:00Z',
        endTime: '2024-04-01T11:00:00Z',
      });

    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(2);
    for (const result of response.body.results) {
      const teeTime = new Date(result.teeTime);
      expect(teeTime.getUTCHours()).toBeGreaterThanOrEqual(10);
      expect(teeTime.getUTCHours()).toBeLessThanOrEqual(11);
    }
  });

  it('should handle pagination with cursor', async () => {
    const response1 = await request(app)
      .get('/search')
      .query({
        date: '2024-04-01T10:00:00Z',
        limit: 2,
      });

    expect(response1.status).toBe(200);
    expect(response1.body.results).toHaveLength(2);
    expect(response1.body.hasMore).toBe(true);

    const response2 = await request(app)
      .get('/search')
      .query({
        date: '2024-04-01T10:00:00Z',
        limit: 2,
        cursor: response1.body.nextCursor,
      });

    expect(response2.status).toBe(200);
    expect(response2.body.results).toHaveLength(1);
    expect(response2.body.hasMore).toBe(false);
  });

  it('should validate date parameter', async () => {
    const response = await request(app)
      .get('/search')
      .query({ date: 'invalid-date' });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Invalid date');
  });
}); 