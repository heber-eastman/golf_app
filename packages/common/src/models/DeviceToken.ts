import mongoose from 'mongoose';

export interface IDeviceToken {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  token: string;
  platform: 'ios' | 'android';
  lastUsed?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const deviceTokenSchema = new mongoose.Schema<IDeviceToken>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  token: { 
    type: String, 
    required: true,
    unique: true 
  },
  platform: { 
    type: String, 
    enum: ['ios', 'android'],
    required: true 
  },
  lastUsed: { type: Date }
}, {
  timestamps: true
});

// Indexes for efficient querying
deviceTokenSchema.index({ userId: 1 });

export function registerDeviceTokenModel(conn: mongoose.Connection) {
  if (conn.models.DeviceToken) {
    return conn.models.DeviceToken;
  }
  return conn.model<IDeviceToken>('DeviceToken', deviceTokenSchema);
}

export const DeviceToken = mongoose.model<IDeviceToken>('DeviceToken', deviceTokenSchema); 