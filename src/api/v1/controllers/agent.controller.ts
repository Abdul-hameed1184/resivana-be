import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response } from "express";
import { sendSuccess } from "../../../utils/response";
import { AppError } from "../../../utils/AppError";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";
import { generateOtp } from "../../../utils/otp";
import { OtpType } from "../../../generated/prisma/enums";
import { otpTemplate } from "../../../templates/otpTemplate";
import { sendEmail } from "../../../services/email.service";


export const getAgent = asyncHandler(async (req: Request, res: Response) => {

    const agentId = req.params.agentId as string;
    if (!agentId) throw new AppError("Agent ID is required", 400, "BAD_REQUEST");

    const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
        },
    });
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
            agent: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });
    if (!properties) throw new AppError("Properties not found", 404, "NOT_FOUND");

    sendSuccess(res, {
        message: "Properties found",
        data: properties,
        statusCode: 200,
    });
})

export const upgradeToAgent = asyncHandler(async (req: Request, res: Response) => {
    const {
        fullName,
        email,
        phone,
        bankCode,
        accountNumber,
        accountName,
    } = req.body;

    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
    if (user.role === "AGENT") throw new AppError("User is already an agent", 400, "BAD_REQUEST");

    const [agent] = await prisma.$transaction([
        prisma.agent.create({
            data: {
                fullName,
                email,
                phone,
                bankCode,
                accountNumber,
                accountName,
                userId,
            }
        }),
        prisma.user.update({
            where: { id: userId },
            data: { role: "AGENT" },
        })
    ]);

    if (!agent) throw new AppError("Failed to create agent", 500, "INTERNAL_SERVER_ERROR");

    sendSuccess(res, {
        message: "Upgraded to agent successfully",
        data: agent,
        statusCode: 201,
    });
})

export const registerAgentFromScratch = asyncHandler(async (req: Request, res: Response) => {
    const {
        firstName,
        lastName,
        userName,
        email,
        password,
        fullName,
        phone,
        bankCode,
        accountNumber,
        accountName,
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new AppError("User with this email already exists", 400, "USER_ALREADY_EXISTS");

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create User with AGENT role
            const newUser = await tx.user.create({
                data: {
                    firstName,
                    lastName,
                    userName: userName || "",
                    email,
                    password: hashedPassword,
                    role: "AGENT",
                },
            });

            // 2. Create Agent record
            const newAgent = await tx.agent.create({
                data: {
                    fullName,
                    email,
                    phone,
                    bankCode,
                    accountNumber,
                    accountName,
                    userId: newUser.id,
                },
            });

            // 3. Handle OTP (Verification)
            const { otp, hashedOtp } = await generateOtp();

            await tx.oTP.create({
                data: {
                    userId: newUser.id,
                    code: hashedOtp,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
                    otpType: OtpType.EMAIL_VERIFY,
                },
            });

            const emailContent = otpTemplate({
                name: newUser.firstName,
                otp,
                type: "VERIFY_EMAIL",
                expiryMinutes: 10,
            });

            await sendEmail({
                to: newUser.email,
                subject: "Verify your email",
                html: emailContent
            });

            return newAgent;
        });

        sendSuccess(res, {
            message: "Agent registered successfully. Please verify your email.",
            data: result,
            statusCode: 201,
        });
    } catch (error: any) {
        console.error("Agent registration failed:", error);
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || "Failed to register agent", 500, "INTERNAL_SERVER_ERROR");
    }
})