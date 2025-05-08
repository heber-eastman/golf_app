import { Course, ICourse } from '../Course';

describe('Course Model', () => {
  const validCourse: ICourse = {
    name: 'Test Golf Course',
    bookingUrl: 'https://example.com/book',
    address: '123 Golf St, Test City',
    holes: 18,
    timeZone: 'America/New_York',
  };

  it('should create a course successfully', async () => {
    const course = new Course(validCourse);
    const savedCourse = await course.save();
    
    expect(savedCourse._id).toBeDefined();
    expect(savedCourse.name).toBe(validCourse.name);
    expect(savedCourse.bookingUrl).toBe(validCourse.bookingUrl);
    expect(savedCourse.address).toBe(validCourse.address);
    expect(savedCourse.holes).toBe(validCourse.holes);
    expect(savedCourse.timeZone).toBe(validCourse.timeZone);
  });

  it('should fail to create a course with invalid holes', async () => {
    const invalidCourse = { ...validCourse, holes: 6 };
    const course = new Course(invalidCourse);
    
    await expect(course.save()).rejects.toThrow();
  });

  it('should fail to create a course with missing required fields', async () => {
    const course = new Course({} as ICourse);
    
    await expect(course.save()).rejects.toThrow();
  });
}); 