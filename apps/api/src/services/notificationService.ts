import { messaging } from '../config/firebase';
import { DeviceToken } from '@golf-app/common';
import { INotificationPref } from '@golf-app/common';
import { ITeeTime } from '@golf-app/common';
import { Types } from 'mongoose';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface FirebaseError {
  code: string;
  message: string;
}

interface TeeTimeWithDetails extends ITeeTime {
  _id: Types.ObjectId;
  courseName: string;
}

export class NotificationService {
  private static async sendToDevice(token: string, payload: NotificationPayload) {
    try {
      await messaging.send({
        token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
      });
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      // If the token is invalid, delete it
      const firebaseError = error as FirebaseError;
      if (firebaseError.code === 'messaging/invalid-registration-token' ||
          firebaseError.code === 'messaging/registration-token-not-registered') {
        await DeviceToken.findOneAndDelete({ token });
      }
      return false;
    }
  }

  private static async sendToDevices(tokens: string[], payload: NotificationPayload) {
    if (tokens.length === 0) return;

    try {
      // Send to each device individually since sendMulticast is not available
      await Promise.all(tokens.map(token => this.sendToDevice(token, payload)));
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }

  public static async notifyNewTeeTime(teeTime: TeeTimeWithDetails, preferences: INotificationPref[], deviceTokens: string[]) {
    if (deviceTokens.length === 0) return;

    const payload: NotificationPayload = {
      title: 'New Tee Time Available!',
      body: `${teeTime.courseName} - ${new Date(teeTime.teeTime).toLocaleString()} - $${teeTime.pricePerPlayer}`,
      data: {
        teeTimeId: teeTime._id.toString(),
        courseId: teeTime.courseId.toString(),
        teeTime: teeTime.teeTime.toISOString(),
      },
    };

    await this.sendToDevices(deviceTokens, payload);
  }

  public static async notifyPriceDrop(teeTime: TeeTimeWithDetails, oldPrice: number, preferences: INotificationPref[], deviceTokens: string[]) {
    if (deviceTokens.length === 0) return;

    const priceDrop = oldPrice - teeTime.pricePerPlayer;
    const payload: NotificationPayload = {
      title: 'Price Drop Alert!',
      body: `${teeTime.courseName} - Price dropped by $${priceDrop} to $${teeTime.pricePerPlayer}`,
      data: {
        teeTimeId: teeTime._id.toString(),
        courseId: teeTime.courseId.toString(),
        teeTime: teeTime.teeTime.toISOString(),
      },
    };

    await this.sendToDevices(deviceTokens, payload);
  }
} 