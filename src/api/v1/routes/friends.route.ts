import { Router } from "express";
import { addFriend, getFriends } from "../controllers/friends.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Friends
 *   description: Friend management routes
 */

/**
 * @swagger
 * /api/v1/friends:
 *   post:
 *     summary: Add a new friend
 *     tags: [Friends]
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
 *               - friendId
 *             properties:
 *               friendId:
 *                 type: string
 *                 description: ID of the user to add as a friend
 *     responses:
 *       201:
 *         description: Friend added successfully
 *       400:
 *         description: Bad request (e.g., missing ID, already friends, adding self)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Friend not found
 * 
 *   get:
 *     summary: Get all friends of the authenticated user
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Friends fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, addFriend);

/**
 * @swagger
 * /api/v1/friends:
 *   get:
 *     summary: Get all friends of the authenticated user
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Friends fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, getFriends);

export default router;