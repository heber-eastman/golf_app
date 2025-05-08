import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';
import { IUser } from '@golf-app/common';
import { requireAuth } from '../middleware/auth';
import { Document } from 'mongoose';

const router = Router();

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    const user = req.user as Document & IUser;
    const token = jwt.sign(
      { id: user.id },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
    );
    res.json({ token, user });
  }
);

// Apple OAuth routes
router.get('/apple',
  passport.authenticate('apple', { scope: ['name', 'email'] })
);

router.get('/apple/callback',
  passport.authenticate('apple', { session: false }),
  async (req, res) => {
    const user = req.user as Document & IUser;
    const token = jwt.sign(
      { id: user.id },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
    );
    res.json({ token, user });
  }
);

// Protected route example
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

export default router; 