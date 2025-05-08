import { User, IUser } from '../User';

describe('User Model', () => {
  const validUser = {
    email: 'test@example.com',
    name: 'Test User',
    googleId: 'google123',
    appleId: 'apple123',
    refreshToken: 'refresh123'
  };

  it('should create a user successfully', async () => {
    const user = new User(validUser);
    const savedUser = await user.save();
    
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.name).toBe(validUser.name);
    expect(savedUser.googleId).toBe(validUser.googleId);
    expect(savedUser.appleId).toBe(validUser.appleId);
    expect(savedUser.refreshToken).toBe(validUser.refreshToken);
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
  });

  it('should fail to create a user with invalid email', async () => {
    const invalidUser = { ...validUser, email: 'invalid-email' };
    const user = new User(invalidUser);
    
    await expect(user.save()).rejects.toThrow();
  });

  it('should fail to create a user with missing required fields', async () => {
    const user = new User({} as IUser);
    
    await expect(user.save()).rejects.toThrow();
  });

  it('should allow creating users with same googleId or appleId', async () => {
    const user1 = new User(validUser);
    await user1.save();
    
    const user2 = new User({
      ...validUser,
      email: 'test2@example.com'
    });
    await expect(user2.save()).resolves.toBeDefined();
  });
}); 