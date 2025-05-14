import mongoose from 'mongoose';
import { TeeTime, INotificationPref, DeviceToken, Course } from '@golf-app/common';
import { NotificationService } from '../../services/notificationService';
import { checkNewTeeTimes } from '../notificationWorker';
import { ITeeTime } from '@golf-app/common/src/models/TeeTime';
import { ICourse } from '@golf-app/common/src/models/Course';
import { IDeviceToken } from '@golf-app/common/src/models/DeviceToken';

// Mock the NotificationService
jest.mock('../../services/notificationService', () => ({
  NotificationService: {
    notifyNewTeeTime: jest.fn(),
    notifyPriceDrop: jest.fn(),
  },
}));

describe('Notification Worker', () => {
  let mockTeeTime: ITeeTime & mongoose.Document;
  let mockCourse: ICourse & mongoose.Document;
  let mockNotificationPref: INotificationPref & mongoose.Document;
  let mockDeviceToken: IDeviceToken & mongoose.Document;

  beforeAll(async () => {
    // Create test data
    mockCourse = await Course.create({
      name: 'Test Golf Course',
      location: 'Test Location',
      timeZone: 'America/New_York',
      holes: 18,
      address: '123 Golf St, Test City',
      bookingUrl: 'https://example.com/book',
    });

    mockTeeTime = await TeeTime.create({
      courseId: mockCourse._id,
      teeTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      holes: 18,
      pricePerPlayer: 50,
      availableSlots: 4,
    });

    mockNotificationPref = await mongoose.connection.models.NotificationPref.create({
      userId: new mongoose.Types.ObjectId(),
      filters: {
        courseId: mockCourse._id,
        maxPrice: 100,
        minSlots: 2,
      },
      frequency: 'immediate',
      lastSent: new Date(),
    });

    mockDeviceToken = await DeviceToken.create({
      userId: mockNotificationPref.userId,
      token: 'test-device-token',
      platform: 'ios',
    });
  });

  afterAll(async () => {
    // Clean up test data
    await Course.deleteMany({});
    await TeeTime.deleteMany({});
    await mongoose.connection.models.NotificationPref.deleteMany({});
    await DeviceToken.deleteMany({});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should find and notify about matching tee times', async () => {
    // Run the worker logic directly
    await checkNewTeeTimes();

    // Verify that NotificationService.notifyNewTeeTime was called
    expect(NotificationService.notifyNewTeeTime).toHaveBeenCalledWith(
      expect.objectContaining({
        courseId: mockCourse._id,
        courseName: mockCourse.name,
      }),
      expect.arrayContaining([expect.objectContaining({
        userId: mockNotificationPref.userId,
      })]),
      expect.arrayContaining(['test-device-token'])
    );
  });

  it('should respect frequency throttling', async () => {
    // Update lastSent to now
    await mongoose.connection.models.NotificationPref.findByIdAndUpdate(
      mockNotificationPref._id,
      { lastSent: new Date() }
    );

    // Run the worker logic directly
    await checkNewTeeTimes();

    // Verify that no notification was sent due to throttling
    expect(NotificationService.notifyNewTeeTime).not.toHaveBeenCalled();
  });

  it('should handle missing device tokens gracefully', async () => {
    // Delete the device token
    await DeviceToken.deleteMany({});

    // Run the worker logic directly
    await checkNewTeeTimes();

    // Verify that no notification was sent
    expect(NotificationService.notifyNewTeeTime).not.toHaveBeenCalled();
  });

  it('should handle missing courses gracefully', async () => {
    // Delete the course
    await Course.deleteMany({});

    // Run the worker logic directly
    await checkNewTeeTimes();

    // Verify that no notification was sent
    expect(NotificationService.notifyNewTeeTime).not.toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    // Mock a database error
    jest.spyOn(mongoose.connection.models.NotificationPref, 'find').mockRejectedValueOnce(new Error('DB Error'));

    // Run the worker logic directly
    await checkNewTeeTimes();

    // Verify that no notification was sent
    expect(NotificationService.notifyNewTeeTime).not.toHaveBeenCalled();
  });
}); 