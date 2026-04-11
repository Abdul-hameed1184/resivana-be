import { z } from "zod";
import { MessageType } from "../../../generated/prisma/client";

export const sendMessageSchema = z.object({
  body: z.object({
    conversationId: z.string().uuid("Invalid conversation ID format"),
    content: z.string().min(1, "Message content cannot be empty"),
    type: z.nativeEnum(MessageType).optional().default(MessageType.MESSAGE),
  }),
});

export const getConversationMessagesSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid conversation ID format"),
  }),
  query: z.object({
    skip: z.coerce.number().int().nonnegative().optional().default(0),
    take: z.coerce.number().int().positive().optional().default(50),
  }),
});
