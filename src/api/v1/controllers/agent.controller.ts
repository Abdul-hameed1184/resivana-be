import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response } from "express";
import { sendSuccess } from "../../../utils/response";
import { AppError } from "../../../utils/AppError";
import { prisma } from "../../../lib/prisma";


export const getAgent = asyncHandler(async (req: Request, res: Response) => {

    const agentId = req.params.agentId as string;
    if (!agentId) throw new AppError("Agent ID is required", 400, "BAD_REQUEST");

    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) throw new AppError("Agent not found", 404, "NOT_FOUND");

    sendSuccess(res, {
        message: "Agent found",
        data: agent,
        statusCode: 200,
    });
   
})

export const AgentProperties = asyncHandler(async (req: Request, res: Response) => {
    const agentId = req.params.agentId as string;
    if (!agentId) throw new AppError("Agent ID is required", 400, "BAD_REQUEST");

    const properties = await prisma.property.findMany({
        where: { agentId },
        include: {
            reviews: true,
            agent: true,
        },
    });
    if (!properties) throw new AppError("Properties not found", 404, "NOT_FOUND");

    sendSuccess(res, {
        message: "Properties found",
        data: properties,
        statusCode: 200,
    });
})

export const registerAgent = asyncHandler(async (req: Request, res: Response) => {
    const {
        fullName,
        email,
        phone,
        bankCode,
        accountNumber,
        accountName,
        userId,
    } = req.body;

    if (!fullName || !email || !phone || !bankCode || !accountNumber || !accountName || !userId) throw new AppError("All fields are required", 400, "BAD_REQUEST");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

    const agent = await prisma.agent.create({
        data: {
            fullName,
            email,
            phone,
            bankCode,
            accountNumber,
            accountName,
            userId,
        }
    });

    await prisma.user.update({
        where: { id: userId },
        data: { role: "AGENT" },
    });

    if (!agent) throw new AppError("Failed to create agent", 500, "INTERNAL_SERVER_ERROR");

    sendSuccess(res, {
        message: "Agent created successfully",
        data: agent,
        statusCode: 201,
    });
})