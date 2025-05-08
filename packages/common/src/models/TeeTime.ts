import mongoose from 'mongoose';

export interface ITeeTime {
  courseId: mongoose.Types.ObjectId;
  teeTime: Date;
  holes: number;
  pricePerPlayer: number;
  availableSlots: number;
}

const teeTimeSchema = new mongoose.Schema<ITeeTime>({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teeTime: { type: Date, required: true },
  holes: { type: Number, required: true, min: 9, max: 36 },
  pricePerPlayer: { type: Number, required: true, min: 0 },
  availableSlots: { type: Number, required: true, min: 0 },
});

// Compound index for efficient querying
teeTimeSchema.index({ courseId: 1, teeTime: 1 }, { unique: true });

export const TeeTime = mongoose.model<ITeeTime>('TeeTime', teeTimeSchema); 