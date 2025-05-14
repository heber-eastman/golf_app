import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { IDeviceToken } from '@golf-app/common';

const DeviceToken = mongoose.connection.models.DeviceToken as mongoose.Model<IDeviceToken>;

const router = Router();

// Match the user type as extended in the auth middleware
type AuthRequest = Request & {
  user?: Document & {
    _id: Types.ObjectId;
    email: string;
    isAdmin: boolean;
  };
};

// Validation schema
const deviceTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android'])
});

// POST /device-tokens
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error Express/Mongoose user type mismatch
router.post('/', requireAuth, (async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const data = deviceTokenSchema.parse(req.body);

    // Update or create the device token
    const deviceToken = await DeviceToken.findOneAndUpdate(
      { token: data.token },
      { 
        userId,
        platform: data.platform,
        lastUsed: new Date()
      },
      { upsert: true, new: true }
    );

    return res.status(200).json(deviceToken);
  } catch (error) {
    console.error('Error registering device token:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}));

// DELETE /device-tokens/:token
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error Express/Mongoose user type mismatch
router.delete('/:token', requireAuth, (async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const deviceToken = await DeviceToken.findOneAndDelete({
      token: req.params.token,
      userId
    });

    if (!deviceToken) {
      return res.status(404).json({ message: 'Device token not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting device token:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}));

export default router; 