import { z } from 'zod';

const authConfigSchema = z.object({
  jwtSecret: z.string().min(32),
  jwtExpiresIn: z.string().default('1y'),
  googleClientId: z.string(),
  googleClientSecret: z.string(),
  appleClientId: z.string(),
  appleTeamId: z.string(),
  appleKeyId: z.string(),
  applePrivateKey: z.string(),
  callbackUrl: z.string().url(),
});

export const authConfig = authConfigSchema.parse({
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars-long',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1y',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  appleClientId: process.env.APPLE_CLIENT_ID || '',
  appleTeamId: process.env.APPLE_TEAM_ID || '',
  appleKeyId: process.env.APPLE_KEY_ID || '',
  applePrivateKey: process.env.APPLE_PRIVATE_KEY || '',
  callbackUrl: process.env.AUTH_CALLBACK_URL || 'http://localhost:3000/auth/callback',
}); 