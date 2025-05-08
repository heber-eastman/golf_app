import { User, IUser } from '../User';

describe('User Model', () => {
  const validUser: Omit<IUser, 'createdAt' | 'updatedAt'> = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123',
    role: 'user',
  };

  it('should create a user successfully', async () => {
    const user = new User(validUser);
    const savedUser = await user.save();
    
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.name).toBe(validUser.name);
    expect(savedUser.password).toBe(validUser.password);
    expect(savedUser.role).toBe(validUser.role);
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

  it('should fail to create a user with invalid role', async () => {
    const invalidUser = { ...validUser, role: 'invalid-role' };
    const user = new User(invalidUser as IUser);
    
    await expect(user.save()).rejects.toThrow();
  });

  it('should fail to create a duplicate user with same email', async () => {
    const user1 = new User(validUser);
    await user1.save();
    
    const user2 = new User(validUser);
    await expect(user2.save()).rejects.toThrow();
  });
}); 