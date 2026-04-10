import { Router } from "express";
import { getBookings, scheduleBooking, updateBooking, deleteBooking } from "../controllers/booking.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management routes
 */

/**
 * @swagger
 * /api/v1/bookings:
 *   get:
 *     summary: Get all bookings for the authenticated user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *       401:
 *         description: Unauthorized
 * 
 *   post:
 *     summary: Schedule a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - properyId
 *               - date
 *             properties:
 *               properyId:
 *                 type: string
 *                 description: ID of the property to book (note the spelling properyId from request payload)
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date of the booking
 *     responses:
 *       201:
 *         description: Booking scheduled successfully
 *       400:
 *         description: Bad request (e.g., missing fields or double booking)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 */
router.get("/", protect, getBookings);

/**
 * @swagger
 * /api/v1/bookings:
 *   post:
 *     summary: Schedule a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - properyId
 *               - date
 *             properties:
 *               properyId:
 *                 type: string
 *                 description: ID of the property to book (note the spelling properyId from request payload)
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date of the booking
 *     responses:
 *       201:
 *         description: Booking scheduled successfully
 *       400:
 *         description: Bad request (e.g., missing fields or double booking)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 */
router.post("/", protect, scheduleBooking);

/**
 * @swagger
 * /api/v1/bookings/{bookingId}/{status}:
 *   put:
 *     summary: Update a booking status
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the booking
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         description: The new status for the booking
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       400:
 *         description: Bad request (missing parameters)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.put("/:bookingId/:status", protect, updateBooking);

/**
 * @swagger
 * /api/v1/bookings/{bookingId}:
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the booking
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.delete("/:bookingId", protect, deleteBooking);

export default router;