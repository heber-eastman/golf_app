import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from '@golf-app/common';
import { Application } from 'express';

let app: Application;
let NotificationPref: mongoose.Model<any>;
let testUser: any;
let testUserToken: string;

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-min-32-chars-long';

describe('Notification Preferences API', () => {
  beforeEach(async () => {
    // Clear users and notification prefs
    await User.deleteMany({});
    if (mongoose.connection.models.NotificationPref) {
      await mongoose.connection.models.NotificationPref.deleteMany({});
    }
    // Create test user
    testUser = await User.create({
      email: 'test@example.com',
      name: 'Test User',
    });
    testUserToken = jwt.sign({ id: testUser._id }, JWT_SECRET, { expiresIn: '1h' });
    NotificationPref = mongoose.connection.models.NotificationPref;
    // Import the app after users are created
    const { createApp } = require('../../server');
    app = createApp();
  });

  describe('GET /notifications/prefs', () => {
    it('should return 401 if no token provided', async () => {
      const response = await request(app).get('/notifications/prefs');
      expect(response.status).toBe(401);
    });

    it('should return empty array if no preferences exist', async () => {
      const response = await request(app)
        .get('/notifications/prefs')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /notifications/prefs', () => {
    it('should create a new notification preference', async () => {
      const preference = {
        filters: {
          maxPrice: 100,
        },
        frequency: 'daily',
      };

      const response = await request(app)
        .post('/notifications/prefs')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(preference);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        userId: testUser._id!.toString(),
        ...preference,
      });
    });

    it('should return 400 for invalid data', async () => {
      // Suppress error logs for this test
      const originalError = console.error;
      console.error = jest.fn();

      const invalidPreference = {
        filters: {
          maxPrice: -100, // Invalid price
        },
        frequency: 'invalid', // Invalid frequency
      };

      const response = await request(app)
        .post('/notifications/prefs')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(invalidPreference);

      expect(response.status).toBe(400);

      // Restore console.error
      console.error = originalError;
    });
  });

  describe('DELETE /notifications/prefs/:id', () => {
    it('should delete a notification preference', async () => {
      // First create a preference
      const preference = {
        filters: {
          maxPrice: 100,
        },
        frequency: 'daily',
      };

      const createResponse = await request(app)
        .post('/notifications/prefs')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(preference);

      const prefId = createResponse.body._id;

      // Then delete it
      const deleteResponse = await request(app)
        .delete(`/notifications/prefs/${prefId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(deleteResponse.status).toBe(204);

      // Verify it's deleted
      const getResponse = await request(app)
        .get('/notifications/prefs')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(getResponse.body).not.toContainEqual(
        expect.objectContaining({ _id: prefId })
      );
    });

    it('should return 404 for non-existent preference', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/notifications/prefs/${nonExistentId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
    });
  });
}); 