import { Request, Response } from "express";
import { ConversationService } from "../services/conversation.service";

export class ConversationController {
  /**
   * GET /api/v1/conversations
   * Fetch all conversations for the authenticated user.
   */
  static async getUserConversations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const conversations = await ConversationService.getUserConversations(userId);
      res.status(200).json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch conversations" });
    }
  }

  /**
   * POST /api/v1/conversations
   * Create or resume a conversation between the current user and another participant.
   */
  static async getOrCreateConversation(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { participantId, propertyId } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!participantId) {
        return res.status(400).json({ error: "Participant ID is required" });
      }

      if (userId === participantId) {
        return res.status(400).json({ error: "You cannot start a conversation with yourself" });
      }

      const conversation = await ConversationService.getOrCreateConversation(
        userId,
        participantId,
        propertyId
      );

      res.status(201).json(conversation);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to create/fetch conversation" });
    }
  }

  /**
   * GET /api/v1/conversations/:id
   * Get a conversation by ID, verifying user participation.
   */
  static async getConversationById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const conversation = await ConversationService.getConversationById(id, userId);

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      res.status(200).json(conversation);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch conversation" });
    }
  }
}
