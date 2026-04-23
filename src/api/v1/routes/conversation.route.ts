import { Router } from "express";
import { ConversationController } from "../controllers/conversation.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: Conversation management between users
 */

/**
 * @swagger
 * /api/v1/conversations:
 *   get:
 *     summary: Get all conversations for the current user
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", ConversationController.getUserConversations);

/**
 * @swagger
 * /api/v1/conversations:
 *   post:
 *     summary: Create or resume a conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [participantId]
 *             properties:
 *               participantId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the user to start a conversation with
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional property ID to link the conversation to
 *     responses:
 *       201:
 *         description: Conversation created or retrieved successfully
 *       400:
 *         description: Bad request (e.g., trying to chat with self)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", ConversationController.getOrCreateConversation);

/**
 * @swagger
 * /api/v1/conversations/{id}:
 *   get:
 *     summary: Get a conversation by ID
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The conversation ID
 *     responses:
 *       200:
 *         description: Conversation details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", ConversationController.getConversationById);

export default router;
