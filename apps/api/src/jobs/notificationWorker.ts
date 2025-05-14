import mongoose from 'mongoose';
import { TeeTime, INotificationPref, DeviceToken } from '@golf-app/common';
import { NotificationService } from '../services/notificationService';
import { Course } from '@golf-app/common';

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function getDeviceTokensForUsers(userIds: mongoose.Types.ObjectId[]): Promise<Map<string, string[]>> {
  const deviceTokens = await DeviceToken.find({ userId: { $in: userIds } });
  const userTokens = new Map<string, string[]>();
  
  deviceTokens.forEach(token => {
    const userId = token.userId.toString();
    const tokens = userTokens.get(userId) || [];
    tokens.push(token.token);
    userTokens.set(userId, tokens);
  });

  return userTokens;
}

export async function checkNewTeeTimes() {
  try {
    // Get all notification preferences
    const preferences = await mongoose.connection.models.NotificationPref.find({});
    
    if (preferences.length === 0) return;

    // Group preferences by user
    const userPreferences = new Map<string, INotificationPref[]>();
    preferences.forEach(pref => {
      const userId = pref.userId.toString();
      const prefs = userPreferences.get(userId) || [];
      prefs.push(pref);
      userPreferences.set(userId, prefs);
    });

    // Get device tokens for all users with preferences
    const userIds = Array.from(userPreferences.keys()).map(id => new mongoose.Types.ObjectId(id));
    const userTokens = await getDeviceTokensForUsers(userIds);

    // Get all courses for name lookup
    const courses = await Course.find({});
    const courseMap = new Map(courses.map(course => [course._id.toString(), course]));

    // For each user's preferences
    for (const [userId, prefs] of userPreferences) {
      const deviceTokens = userTokens.get(userId) || [];
      if (deviceTokens.length === 0) continue;

      // For each preference
      for (const pref of prefs) {
        const now = new Date();
        const query: Record<string, unknown> = {};

        // Apply filters
        if (pref.filters.courseId) {
          query.courseId = new mongoose.Types.ObjectId(pref.filters.courseId);
        }
        if (pref.filters.maxPrice) {
          query.pricePerPlayer = { $lte: pref.filters.maxPrice };
        }
        if (pref.filters.minSlots) {
          query.availableSlots = { $gte: pref.filters.minSlots };
        }
        if (pref.filters.startTime || pref.filters.endTime) {
          query.teeTime = {} as Record<string, unknown>;
          if (pref.filters.startTime) {
            (query.teeTime as Record<string, unknown>)["$gte"] = new Date(pref.filters.startTime);
          }
          if (pref.filters.endTime) {
            (query.teeTime as Record<string, unknown>)["$lte"] = new Date(pref.filters.endTime);
          }
        }

        // Only get tee times that are in the future
        if (!query.teeTime) {
          query.teeTime = {} as Record<string, unknown>;
        }
        (query.teeTime as Record<string, unknown>)["$gt"] = now;

        // Get matching tee times
        const teeTimes = await TeeTime.find(query).sort({ teeTime: 1 });

        // Send notifications for each matching tee time
        for (const teeTime of teeTimes) {
          const course = courseMap.get(teeTime.courseId.toString());
          if (!course) continue;

          const teeTimeWithDetails = {
            ...teeTime.toObject(),
            courseName: course.name,
          };

          await NotificationService.notifyNewTeeTime(
            teeTimeWithDetails,
            [pref],
            deviceTokens
          );
        }
      }
    }
  } catch (error) {
    console.error('Error in notification worker:', error);
  }
}

export function startNotificationWorker() {
  // Run immediately on startup
  checkNewTeeTimes();

  // Then run every 5 minutes
  setInterval(checkNewTeeTimes, CHECK_INTERVAL);
} 