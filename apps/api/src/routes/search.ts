import { Router } from 'express';
import { z } from 'zod';
import { TeeTime } from '@golf-app/common';

const router = Router();

const searchParamsSchema = z.object({
  date: z.string().transform(str => new Date(str)).refine(d => !isNaN(d.getTime()), { message: 'Invalid date' }),
  courseId: z.string().optional(),
  maxPrice: z.string().transform(str => parseFloat(str)).optional(),
  minSlots: z.string().transform(str => parseInt(str, 10)).optional(),
  startTime: z.string().transform(str => new Date(str)).refine(d => !isNaN(d.getTime()), { message: 'Invalid date' }).optional(),
  endTime: z.string().transform(str => new Date(str)).refine(d => !isNaN(d.getTime()), { message: 'Invalid date' }).optional(),
  cursor: z.string().optional(),
  limit: z.string().transform(str => parseInt(str, 10)).optional(),
});

router.get('/search', async (req, res) => {
  try {
    const params = searchParamsSchema.parse(req.query);
    
    // Build query
    const query: Record<string, unknown> = {};

    // Set date range
    if (params.startTime && params.endTime) {
      query.teeTime = {
        $gte: new Date(params.startTime),
        $lte: new Date(params.endTime),
      };
    } else {
      query.teeTime = {
        $gte: new Date(params.date.setHours(0, 0, 0, 0)),
        $lte: new Date(params.date.setHours(23, 59, 59, 999)),
      };
    }

    if (params.courseId) {
      query.courseId = params.courseId;
    }

    if (params.maxPrice) {
      query.pricePerPlayer = { $lte: params.maxPrice };
    }

    if (params.minSlots) {
      query.availableSlots = { $gte: params.minSlots };
    }

    // Get total count for pagination
    const total = await TeeTime.countDocuments(query);

    // Build cursor-based pagination
    if (params.cursor) {
      try {
        const decodedCursor = Buffer.from(params.cursor, 'base64').toString();
        const [teeTimeStr, courseId] = decodedCursor.split('|');
        const teeTime = new Date(teeTimeStr);
        // Validate cursor fields
        if (!teeTimeStr || !courseId || isNaN(teeTime.getTime())) {
          return res.status(400).json({ message: 'Invalid cursor format' });
        }
        query.$or = [
          { teeTime: { $gt: teeTime } },
          { teeTime, courseId: { $gt: courseId } }
        ];
      } catch (e) {
        return res.status(400).json({ message: 'Invalid cursor format' });
      }
    }

    // Execute query with deduplication
    const limit = params.limit || 20;
    const teeTimes = await TeeTime.find(query)
      .sort({ teeTime: 1, courseId: 1 })
      .limit(limit * 2) // Get more results to account for potential duplicates
      .lean();

    // Deduplicate by courseId + teeTime
    const seen = new Set();
    const uniqueTeeTimes = teeTimes.filter(tt => {
      const key = `${tt.courseId}|${tt.teeTime.toISOString()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Always slice to the requested limit after deduplication
    const results = uniqueTeeTimes.slice(0, limit);
    const hasMore = uniqueTeeTimes.length > limit;

    // Build next cursor
    let nextCursor: string | undefined;
    if (hasMore && results.length > 0) {
      const lastResult = results[results.length - 1];
      const cursorStr = `${lastResult.teeTime.toISOString()}|${lastResult.courseId}`;
      nextCursor = Buffer.from(cursorStr).toString('base64');
    }

    res.json({
      results,
      total,
      hasMore,
      nextCursor,
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors[0]?.message || 'Invalid search parameters';
      return res.status(400).json({ message });
    }
    if (error instanceof Error && error.message.includes('Invalid cursor format')) {
      return res.status(400).json({ message: 'Invalid cursor format' });
    }
    if (error instanceof Error && error.message.includes('Invalid date')) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error searching tee times' });
    return;
  }
});

export default router; 