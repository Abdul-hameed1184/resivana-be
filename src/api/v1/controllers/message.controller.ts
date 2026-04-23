import { Request, Response } from "express";
import { MessageService } from "../services/message.service";

export class MessageController {
  /**
   * POST /api/v1/messages
   * Send a new message.
   */
  static async sendMessage(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { conversationId, content, type } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!conversationId || !content) {
        return res.status(400).json({ error: "Conversation ID and content are required" });
      }

      const message = await MessageService.sendMessage({
        senderId: userId,
        conversationId,
        content,
        type
      });

      res.status(201).json(message);
    } catch (error: any) {
      if (error.message.includes("not found") || error.message.includes("not authorized")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || "Failed to send message" });
    }
  }

  /**
   * GET /api/v1/messages/conversation/:id
   * Get all messages for a specific conversation.
   */
  static async getConversationMessages(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id as string;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const messages = await MessageService.getMessagesByConversationId(conversationId, userId);
      res.status(200).json(messages);
    } catch (error: any) {
      if (error.message.includes("not found") || error.message.includes("not authorized")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || "Failed to fetch messages" });
    }
  }

  /**
   * DELETE /api/v1/messages/:id
   * Delete a specific message.
   */
  static async deleteMessage(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const messageId = req.params.id as string;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await MessageService.deleteMessage(messageId, userId);
      res.status(204).send();
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || "Failed to delete message" });
    }
  }
}
