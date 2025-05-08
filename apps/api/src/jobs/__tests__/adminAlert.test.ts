import { UploadBatch } from '@golf-app/common';
import { checkDailyUpload } from '../adminAlert';
import { startOfDay, endOfDay } from 'date-fns';

// Mock the entire @golf-app/common module
jest.mock('@golf-app/common', () => ({
  UploadBatch: {
    find: jest.fn(),
  },
}));

describe('Admin Alert Job', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not check if before 12 PM MT', async () => {
    // Mock current time to 11 AM MT
    const mockDate = new Date('2024-04-01T17:00:00Z'); // 11 AM MT
    jest.setSystemTime(mockDate);

    await checkDailyUpload();

    expect(UploadBatch.find).not.toHaveBeenCalled();
  });

  it('should check for uploads after 12 PM MT', async () => {
    // Mock current time to 1 PM MT
    const mockDate = new Date('2024-04-01T19:00:00Z'); // 1 PM MT
    jest.setSystemTime(mockDate);

    const today = startOfDay(mockDate);
    const tomorrow = endOfDay(mockDate);

    (UploadBatch.find as jest.Mock).mockResolvedValue([]);

    await checkDailyUpload();

    expect(UploadBatch.find).toHaveBeenCalledWith({
      createdAt: {
        $gte: today,
        $lte: tomorrow,
      },
    });
  });

  it('should not warn if uploads exist', async () => {
    // Mock current time to 1 PM MT
    const mockDate = new Date('2024-04-01T19:00:00Z'); // 1 PM MT
    jest.setSystemTime(mockDate);

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    (UploadBatch.find as jest.Mock).mockResolvedValue([{ _id: '123' }]);

    await checkDailyUpload();

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should warn if no uploads exist', async () => {
    // Mock current time to 1 PM MT
    const mockDate = new Date('2024-04-01T19:00:00Z'); // 1 PM MT
    jest.setSystemTime(mockDate);

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    (UploadBatch.find as jest.Mock).mockResolvedValue([]);

    await checkDailyUpload();

    expect(consoleSpy).toHaveBeenCalledWith('No uploads found for today by 12 PM MT');
    consoleSpy.mockRestore();
  });
}); 