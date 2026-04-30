import { Router } from "express";
import { MessageController } from "../controllers/message.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Messaging operations within conversations
 */

/**
 * @swagger
 * /api/v1/messages:
 *   post:
 *     summary: Send a message in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [conversationId, content]
 *             properties:
 *               conversationId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the conversation
 *               content:
 *                 type: string
 *                 description: Message content
 *               type:
 *                 type: string
 *                 enum: [MESSAGE, PAYMENT]
 *                 default: MESSAGE
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
router.post("/", MessageController.sendMessage);

/**
 * @swagger
 * /api/v1/messages/conversation/{id}:
 *   get:
 *     summary: Get all messages in a conversation
 *     tags: [Messages]
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
 *         description: Messages retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
router.get("/conversation/:id", MessageController.getConversationMessages);

/**
 * @swagger
 * /api/v1/messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *         csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The message ID
 *     responses:
 *       204:
 *         description: Message deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not the sender)
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", MessageController.deleteMessage);

export default router;
