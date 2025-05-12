/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search for tee times
 *     tags: [TeeTimes]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to search for tee times
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price per player
 *       - in: query
 *         name: slots
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *         description: Minimum number of available slots
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start time for tee time range
 *       - in: query
 *         name: endTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End time for tee time range
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor for pagination
 *     responses:
 *       200:
 *         description: List of tee times
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TeeTime'
 *                 total:
 *                   type: integer
 *                   description: Total number of results
 *                 hasMore:
 *                   type: boolean
 *                   description: Whether there are more results
 *                 nextCursor:
 *                   type: string
 *                   description: Cursor for next page
 *       400:
 *         description: Invalid search parameters
 *       500:
 *         description: Server error
 */ 