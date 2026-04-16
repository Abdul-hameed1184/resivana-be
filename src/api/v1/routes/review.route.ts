import { Router } from "express";
import { addReview, getPropertyReviews, getAgentReviews, editReview, deleteReview } from "../controllers/review.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management routes
 */

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     summary: Add a new review for a property
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - rating
 *               - comment
 *             properties:
 *               propertyId:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 * 
 *   put:
 *     summary: Edit an existing review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reviewId
 *               - rating
 *               - comment
 *             properties:
 *               reviewId:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.post("/", protect, addReview);

/**
 * @swagger
 * /api/v1/reviews:
 *   put:
 *     summary: Edit an existing review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reviewId
 *               - rating
 *               - comment
 *             properties:
 *               reviewId:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.put("/", protect, editReview);

/**
 * @swagger
 * /api/v1/reviews/property/{propertyId}:
 *   get:
 *     summary: Get all reviews for a specific property
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the property
 *     responses:
 *       200:
 *         description: Reviews fetched successfully
 *       400:
 *         description: Property ID is required
 */
router.get("/property/:propertyId", protect, getPropertyReviews);

/**
 * @swagger
 * /api/v1/reviews/agent/{agentId}:
 *   get:
 *     summary: Get all reviews for an agent's properties
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the agent
 *     responses:
 *       200:
 *         description: Reviews fetched successfully
 *       400:
 *         description: Agent ID is required
 */
router.get("/agent/:agentId", protect, getAgentReviews);

/**
 * @swagger
 * /api/v1/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *         csrfToken: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the review to delete
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.delete("/:reviewId", protect, deleteReview);

export default router;