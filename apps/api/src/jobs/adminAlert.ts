import { UploadBatch } from '@golf-app/common';
import { startOfDay, endOfDay } from 'date-fns';
import cron from 'node-cron';

export const checkDailyUpload = async () => {
  const now = new Date();
  // Convert to Mountain Time (UTC-6 or UTC-7 depending on daylight saving)
  const mtOffset = -6; // Mountain Time offset from UTC
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const mountainTime = new Date(utc + (3600000 * mtOffset));

  // Check if we're past 12 PM MT
  if (mountainTime.getHours() < 12) {
    return; // Too early to check
  }

  const today = startOfDay(mountainTime);
  const tomorrow = endOfDay(mountainTime);

  const uploads = await UploadBatch.find({
    createdAt: {
      $gte: today,
      $lte: tomorrow,
    },
  });

  if (uploads.length === 0) {
    // TODO: Send email alert
    console.warn('No uploads found for today by 12 PM MT');
  }
};

// Schedule the check to run every hour
export const startUploadCheckScheduler = () => {
  // Run at minute 0 of every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await checkDailyUpload();
    } catch (error) {
      console.error('Error checking daily upload:', error);
    }
  });
}; 