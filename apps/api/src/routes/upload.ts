import { Router, Request } from 'express';
import multer from 'multer';
import { parse } from 'fast-csv';
import { Readable } from 'stream';
import { requireAuth } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';
import { Course, TeeTime, UploadBatch } from '@golf-app/common';
import { z } from 'zod';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const csvRowSchema = z.object({
  courseId: z.string(),
  courseName: z.string(),
  teeTime: z.string().transform(str => new Date(str)),
  holes: z.string().transform(str => parseInt(str, 10)).pipe(z.number().min(9).max(18)),
  pricePerPlayer: z.string().transform(str => parseFloat(str)).pipe(z.number().min(0)),
  availableSlots: z.string().transform(str => parseInt(str, 10)).pipe(z.number().min(1).max(4)),
  bookingUrl: z.string().url(),
  address: z.string(),
  timeZone: z.string(),
});

const REQUIRED_HEADERS = [
  'courseId',
  'courseName',
  'teeTime',
  'holes',
  'pricePerPlayer',
  'availableSlots',
  'bookingUrl',
  'address',
  'timeZone',
];

interface UploadRequest extends Request {
  file?: Express.Multer.File;
}

router.post('/upload',
  requireAuth,
  isAdmin,
  upload.single('file'),
  async (req: UploadRequest, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const batch = new UploadBatch({
      uploadedBy: req.user?._id,
      importedCount: 0,
      skippedCount: 0,
      validationErrors: [],
    });

    const stream = Readable.from(req.file.buffer);
    const parser = parse({ headers: true });

    try {
      for await (const row of stream.pipe(parser)) {
        // Skip empty rows
        if (Object.keys(row).length === 0) {
          continue;
        }

        // Handle malformed rows
        if (Object.keys(row).length !== REQUIRED_HEADERS.length) {
          batch.skippedCount++;
          batch.validationErrors.push({
            row: batch.importedCount + batch.skippedCount,
            message: 'Invalid number of columns',
          });
          continue;
        }

        try {
          // Parse and validate row
          const data = csvRowSchema.parse(row);

          // Upsert course
          const course = await Course.findOneAndUpdate(
            { _id: data.courseId },
            {
              name: data.courseName,
              bookingUrl: data.bookingUrl,
              address: data.address,
              holes: data.holes,
              timeZone: data.timeZone,
            },
            { upsert: true, new: true }
          );

          // Check if tee time already exists
          const existingTeeTime = await TeeTime.findOne({
            courseId: course._id,
            teeTime: data.teeTime,
          });

          if (existingTeeTime) {
            // Update existing tee time
            await TeeTime.findOneAndUpdate(
              {
                courseId: course._id,
                teeTime: data.teeTime,
              },
              {
                holes: data.holes,
                pricePerPlayer: data.pricePerPlayer,
                availableSlots: data.availableSlots,
              }
            );
          } else {
            // Create new tee time
            await TeeTime.create({
              courseId: course._id,
              teeTime: data.teeTime,
              holes: data.holes,
              pricePerPlayer: data.pricePerPlayer,
              availableSlots: data.availableSlots,
            });
            batch.importedCount++;
          }
        } catch (error) {
          batch.skippedCount++;
          batch.validationErrors.push({
            row: batch.importedCount + batch.skippedCount,
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      await batch.save();

      res.json({
        success: true,
        batch: {
          id: batch._id,
          importedCount: batch.importedCount,
          skippedCount: batch.skippedCount,
          validationErrors: batch.validationErrors,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error processing CSV',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router; 