import { z } from "zod";

export const createConversationSchema = z.object({
  body: z.object({
    participantId: z.string().uuid("Invalid participant ID format"),
    propertyId: z.string().uuid("Invalid property ID format").optional(),
  }),
});

export const getConversationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid conversation ID format"),
  }),
});
