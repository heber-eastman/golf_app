import mongoose from 'mongoose';

export interface INotificationPref {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  filters: {
    courseId?: string;
    maxPrice?: number;
    minSlots?: number;
    startTime?: string;
    endTime?: string;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  lastSent?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const notificationPrefSchema = new mongoose.Schema<INotificationPref>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  filters: {
    courseId: { type: String },
    maxPrice: { type: Number, min: 0 },
    minSlots: { type: Number, min: 1 },
    startTime: { type: String },
    endTime: { type: String }
  },
  frequency: { 
    type: String, 
    enum: ['immediate', 'daily', 'weekly'],
    required: true 
  },
  lastSent: { type: Date }
}, {
  timestamps: true
});

// Indexes for efficient querying
notificationPrefSchema.index({ userId: 1 });
notificationPrefSchema.index({ lastSent: 1 });

export function registerNotificationPrefModel(conn: mongoose.Connection) {
  if (conn.models.NotificationPref) {
    return conn.models.NotificationPref;
  }
  return conn.model<INotificationPref>('NotificationPref', notificationPrefSchema);
}

export const NotificationPref = mongoose.model<INotificationPref>('NotificationPref', notificationPrefSchema); 