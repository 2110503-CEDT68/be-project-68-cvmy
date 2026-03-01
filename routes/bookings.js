const express = require("express");
const {
  getBookings,
  getBooking,
  addBooking,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookings");

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(protect, getBookings)
  .post(protect, authorize("admin", "user"), addBooking);

router
  .route("/:id")
  .get(protect, getBooking)
  .put(protect, authorize("admin", "user"), updateBooking)
  .delete(protect, authorize("admin", "user"), deleteBooking);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - bookingDate
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the booking
 *         bookingDate:
 *           type: string
 *           format: date-time
 *           description: Date and time of the booking
 *         user:
 *           type: string
 *           format: uuid
 *           description: User ID who made the booking
 *         provider:
 *           type: string
 *           format: uuid
 *           description: Provider ID of the rental car
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *       example:
 *         id: 609bda561452242d88d36e37
 *         bookingDate: 2026-10-01T09:00:00.000Z
 *         user: 609bda561452242d88d36e37
 *         provider: 609bda561452242d88d36e38
 *         createdAt: 2026-02-25T10:00:00.000Z
 */

/**
 * @swagger
 * tags:
 *   - name: Bookings
 *     description: The car rental bookings managing API
 */

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Returns the list of all bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Not authorized to view this booking
 *       404:
 *         description: Booking not found
 */

/**
 * @swagger
 * /providers/{providerId}/bookings:
 *   post:
 *     summary: Create a new booking for a specific provider
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Provider ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingDate
 *             properties:
 *               bookingDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Booking created successfully
 *       400:
 *         description: Bad request (e.g., Exceeded 3 bookings limit)
 *       404:
 *         description: Provider not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Update booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       401:
 *         description: Not authorized to update this booking
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Delete booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       401:
 *         description: Not authorized to delete this booking
 *       404:
 *         description: Booking not found
 */