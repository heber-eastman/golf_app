import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@golf-app/common';
import { authConfig } from '../config/auth';
import { Document, Types } from 'mongoose';

// TODO: Fix type issues with User model
// Current issues:
// 1. Type mismatch between User model and Request.user
// 2. isAdmin property not recognized on User type
// These are type-only issues, functionality works correctly

// Extend Express Request type to include user
declare module 'express' {
  interface Request {
    user?: Document & {
      _id: Types.ObjectId;
      email: string;
      isAdmin: boolean;
    };
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, authConfig.jwtSecret) as {
      id: string;
    };

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export const requireAuth = authenticate; 