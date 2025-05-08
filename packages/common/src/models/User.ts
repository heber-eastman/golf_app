import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  googleId?: string;
  appleId?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  appleId: {
    type: String,
    sparse: true,
  },
  refreshToken: {
    type: String,
  },
}, {
  timestamps: true,
});

export const User = model<IUser>('User', userSchema); 