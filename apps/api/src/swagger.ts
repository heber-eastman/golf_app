/**
 * @swagger
 * components:
 *   schemas:
 *     TeeTime:
 *       type: object
 *       required:
 *         - courseId
 *         - courseName
 *         - teeTime
 *         - holes
 *         - pricePerPlayer
 *         - availableSlots
 *       properties:
 *         courseId:
 *           type: string
 *           description: MongoDB ObjectId of the course
 *         courseName:
 *           type: string
 *           description: Name of the golf course
 *         teeTime:
 *           type: string
 *           format: date-time
 *           description: Scheduled tee time
 *         holes:
 *           type: integer
 *           enum: [9, 18]
 *           description: Number of holes
 *         pricePerPlayer:
 *           type: number
 *           description: Price per player in dollars
 *         availableSlots:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *           description: Number of available slots
 *         courseUrl:
 *           type: string
 *           format: uri
 *           description: URL of the course website
 *         courseAddress:
 *           type: string
 *           description: Physical address of the course
 *         timezone:
 *           type: string
 *           description: IANA timezone of the course
 *
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