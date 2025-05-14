import mongoose from 'mongoose';

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  email: string;
  name: string;
  googleId?: string;
  appleId?: string;
  refreshToken?: string;
  isAdmin?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  name: { type: String, required: true },
  googleId: { type: String },
  appleId: { type: String },
  refreshToken: { type: String },
  isAdmin: { type: Boolean, default: false },
}, {
  timestamps: true
});

// Compound indexes for efficient querying
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ appleId: 1 }, { sparse: true });

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema); 