import { prisma } from "../../../lib/prisma";

export class ConversationService {
  /**
   * Get all conversations for a user with participant details and latest message info.
   */
  static async getUserConversations(userId: string) {
    return prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: userId }
        }
      },
      include: {
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            isOnline: true
          }
        },
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
  }

  /**
   * Get or create a 1-on-1 conversation between the current user and another participant.
   * Can optionally be tied to a specific property.
   */
  static async getOrCreateConversation(userId: string, participantId: string, propertyId?: string) {
    // 1. Check if a conversation already exists with exactly these two participants
    // and the same property (if propertyId is provided)
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: userId } } },
          { participants: { some: { id: participantId } } },
          { propertyId: propertyId || null }
        ]
      },
      include: {
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            isOnline: true
          }
        }
      }
    });

    if (existingConversation) {
      return existingConversation;
    }

    // 2. Create new conversation
    return prisma.conversation.create({
      data: {
        propertyId: propertyId || null,
        participants: {
          connect: [
            { id: userId },
            { id: participantId }
          ]
        }
      },
      include: {
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            isOnline: true
          }
        }
      }
    });
  }

  /**
   * Get a conversation by ID, verifying the user is a participant.
   */
  static async getConversationById(id: string, userId: string) {
    return prisma.conversation.findFirst({
      where: {
        id,
        participants: { some: { id: userId } }
      },
      include: {
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            isOnline: true
          }
        },
        property: true
      }
    });
  }
}
