import mongoose from 'mongoose';

export interface IUploadBatch {
  _id?: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  importedCount: number;
  skippedCount: number;
  validationErrors: Array<{
    row: number;
    message: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

const uploadBatchSchema = new mongoose.Schema<IUploadBatch>({
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  importedCount: {
    type: Number,
    required: true,
    default: 0,
  },
  skippedCount: {
    type: Number,
    required: true,
    default: 0,
  },
  validationErrors: [{
    row: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  }],
}, {
  timestamps: true,
});

export const UploadBatch = mongoose.model<IUploadBatch>('UploadBatch', uploadBatchSchema); 