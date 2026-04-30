import { prisma } from "../../../lib/prisma";
import { MessageType } from "../../../generated/prisma/enums";

export class MessageService {
  /**
   * Send a message in a conversation.
   * Updates the conversation's lastMessage and updatedAt.
   */
  static async sendMessage(data: {
    senderId: string;
    conversationId: string;
    content: string;
    type?: MessageType;
  }) {
    const { senderId, conversationId, content, type = MessageType.MESSAGE } = data;

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: senderId } }
      }
    });

    if (!conversation) {
      throw new Error("Conversation not found or user not authorized");
    }

    // Use a transaction to ensure message creation and conversation update happen together
    return prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          senderId,
          conversationId,
          content,
          type
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true
            }
          }
        }
      });

      // Update conversation's last message and timestamp
      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: content,
          updatedAt: new Date()
        }
      });

      return message;
    });
  }

  /**
   * Get all messages for a conversation.
   * Verifies that the user is a participant.
   */
  static async getMessagesByConversationId(conversationId: string, userId: string) {
    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: userId } }
      }
    });

    if (!conversation) {
      throw new Error("Conversation not found or user not authorized");
    }

    return prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });
  }

  /**
   * Delete a message.
   * Only the sender can delete their own message.
   */
  static async deleteMessage(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== userId) {
      throw new Error("Unauthorized to delete this message");
    }

    return prisma.message.delete({
      where: { id: messageId }
    });
  }
}
