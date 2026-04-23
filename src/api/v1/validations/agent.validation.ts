import { z } from "zod";

export const upgradeToAgentSchema = z.object({
  body: z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters long"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(10, "Phone number too short"),
    bankCode: z.string().min(4, "Bank code is required"),
    accountNumber: z.string().min(10, "Account number too short"),
    accountName: z.string().min(3, "Account name is required"),
  }),
});

export const registerAgentFromScratchSchema = z.object({
  body: z.object({
    // User fields
    firstName: z.string().min(2, "First name too short"),
    lastName: z.string().min(2, "Last name too short"),
    userName: z.string().optional(),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    
    // Agent fields
    fullName: z.string().min(3, "Full name too short"),
    phone: z.string().min(10, "Phone number too short"),
    bankCode: z.string().min(3, "Bank code required"),
    accountNumber: z.string().min(10, "Account number too short"),
    accountName: z.string().min(3, "Account name required"),
  }),
});

export const agentIdParamSchema = z.object({
  params: z.object({
    agentId: z.string().uuid("Invalid agent ID format"),
  }),
});
