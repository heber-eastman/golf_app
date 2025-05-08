import mongoose from 'mongoose';

export interface ICourse {
  name: string;
  bookingUrl: string;
  address: string;
  holes: number;
  timeZone: string;
}

const courseSchema = new mongoose.Schema<ICourse>({
  name: { type: String, required: true },
  bookingUrl: { type: String, required: true },
  address: { type: String, required: true },
  holes: { type: Number, required: true, min: 9, max: 36 },
  timeZone: { type: String, required: true },
});

export const Course = mongoose.model<ICourse>('Course', courseSchema); 