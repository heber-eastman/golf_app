import mongoose from 'mongoose';
import { Course } from '../Course';
import { TeeTime, ITeeTime } from '../TeeTime';

describe('TeeTime Model', () => {
  let courseId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const course = await Course.create({
      name: 'Test Golf Course',
      bookingUrl: 'https://example.com/book',
      address: '123 Golf St, Test City',
      holes: 18,
      timeZone: 'America/New_York',
    });
    courseId = course._id;
  });

  const validTeeTime: Omit<ITeeTime, 'courseId'> = {
    teeTime: new Date('2024-04-01T10:00:00Z'),
    holes: 18,
    pricePerPlayer: 50,
    availableSlots: 4,
  };

  it('should create a tee time successfully', async () => {
    const teeTime = new TeeTime({ ...validTeeTime, courseId });
    const savedTeeTime = await teeTime.save();
    
    expect(savedTeeTime._id).toBeDefined();
    expect(savedTeeTime.courseId.toString()).toBe(courseId.toString());
    expect(savedTeeTime.teeTime).toEqual(validTeeTime.teeTime);
    expect(savedTeeTime.holes).toBe(validTeeTime.holes);
    expect(savedTeeTime.pricePerPlayer).toBe(validTeeTime.pricePerPlayer);
    expect(savedTeeTime.availableSlots).toBe(validTeeTime.availableSlots);
  });

  it('should fail to create a tee time with invalid holes', async () => {
    const invalidTeeTime = { ...validTeeTime, courseId, holes: 6 };
    const teeTime = new TeeTime(invalidTeeTime);
    
    await expect(teeTime.save()).rejects.toThrow();
  });

  it('should fail to create a tee time with negative price', async () => {
    const invalidTeeTime = { ...validTeeTime, courseId, pricePerPlayer: -10 };
    const teeTime = new TeeTime(invalidTeeTime);
    
    await expect(teeTime.save()).rejects.toThrow();
  });

  it('should fail to create a tee time with negative available slots', async () => {
    const invalidTeeTime = { ...validTeeTime, courseId, availableSlots: -1 };
    const teeTime = new TeeTime(invalidTeeTime);
    
    await expect(teeTime.save()).rejects.toThrow();
  });

  it('should fail to create duplicate tee times for same course and time', async () => {
    const teeTime1 = new TeeTime({ ...validTeeTime, courseId });
    await teeTime1.save();
    
    const teeTime2 = new TeeTime({ ...validTeeTime, courseId });
    await expect(teeTime2.save()).rejects.toThrow();
  });
}); 