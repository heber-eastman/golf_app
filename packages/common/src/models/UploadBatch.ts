import mongoose from 'mongoose';

export interface IUploadBatch {
  courseId: mongoose.Types.ObjectId;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  errorCount: number;
  errors: string[];
  startedAt: Date;
  completedAt?: Date;
}

const uploadBatchSchema = new mongoose.Schema<IUploadBatch>({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  totalRecords: { type: Number, required: true, min: 0 },
  processedRecords: { type: Number, required: true, min: 0, default: 0 },
  errorCount: { type: Number, required: true, min: 0, default: 0 },
  errors: [{ type: String }],
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export const UploadBatch = mongoose.model<IUploadBatch>('UploadBatch', uploadBatchSchema); 