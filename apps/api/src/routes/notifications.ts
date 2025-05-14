import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { INotificationPref } from '@golf-app/common/src/models/notificationPref2';
import { IUser } from '@golf-app/common';

const NotificationPref = mongoose.connection.models.NotificationPref as mongoose.Model<INotificationPref>;

const router = Router();

// Validation schemas
const filterSchema = z.object({
  courseId: z.string().optional(),
  maxPrice: z.number().min(0).optional(),
  minSlots: z.number().min(1).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

const notificationPrefSchema = z.object({
  filters: filterSchema,
  frequency: z.enum(['immediate', 'daily', 'weekly']),
});

// GET /notifications/prefs
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error Express/Mongoose user type mismatch
router.get('/prefs', requireAuth, (async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const prefs = await NotificationPref.find({ userId });
    return res.json(prefs);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}) as any);

// POST /notifications/prefs
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error Express/Mongoose user type mismatch
router.post('/prefs', requireAuth, (async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const data = notificationPrefSchema.parse(req.body);
    const pref = await NotificationPref.create({ ...data, userId });
    return res.status(201).json(pref);
  } catch (error) {
    console.error('Error creating notification preference:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    return res.status(400).json({ message: 'Invalid data' });
  }
}) as any);

// DELETE /notifications/prefs/:id
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error Express/Mongoose user type mismatch
router.delete('/prefs/:id', requireAuth, (async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const pref = await NotificationPref.findOneAndDelete({ _id: req.params.id, userId });
    if (!pref) {
      return res.status(404).json({ message: 'Preference not found' });
    }
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting notification preference:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}) as any);

export default router; 