import request from 'supertest';
import app from '../../server';
import { User } from '@golf-app/common';
import jwt from 'jsonwebtoken';
import { authConfig } from '../../config/auth';
import mongoose from 'mongoose';

describe('Auth Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('GET /auth/me', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/auth/me');
      expect(response.status).toBe(401);
    });

    it('should return user info with valid token', async () => {
      const user = await User.create({
        email: 'test@example.com',
        name: 'Test User',
      });

      const token = jwt.sign({ id: user._id }, authConfig.jwtSecret, { expiresIn: '1y' });
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        email: user.email,
        name: user.name,
      });
    });
  });

  describe('GET /auth/google', () => {
    it('should redirect to Google OAuth', async () => {
      const response = await request(app).get('/auth/google');
      expect(response.status).toBe(302);
      expect(response.header.location).toContain('accounts.google.com');
    });
  });

  describe('GET /auth/apple', () => {
    it('should redirect to Apple OAuth', async () => {
      const response = await request(app).get('/auth/apple');
      expect(response.status).toBe(302);
      expect(response.header.location).toContain('appleid.apple.com');
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
}); 