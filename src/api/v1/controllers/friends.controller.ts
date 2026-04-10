import { AppError } from "../../../utils/AppError";
import { prisma } from "../../../lib/prisma";
import { sendSuccess } from "../../../utils/response";
import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";

export const addFriend = asyncHandler(async (req: Request, res: Response) => {
    const friendId = req.body.friendId as string;
    if (!friendId) throw new AppError("Friend ID is required", 400, "BAD_REQUEST");

    const userId = req.user?.id;
    if (!userId) {
        throw new AppError("Unauthorized access", 401, "UNAUTHORIZED");
    }

    const friend = await prisma.user.findUnique({ where: { id: friendId } });
    if (!friend) throw new AppError("Friend not found", 404, "NOT_FOUND");
    if (userId === friendId) throw new AppError("You cannot add yourself as a friend", 400, "BAD_REQUEST");

    const existingFriend = await prisma.user.findFirst({
        where: {
            id: userId,
            friends: {
                some: {
                    id: friendId,
                },
            },
        },
    });
    if (existingFriend) throw new AppError("You are already friends", 400, "BAD_REQUEST");

    const [updatedUser] = await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: {
                friends: { connect: { id: friendId } },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePicture: true,
            },
        }),
        prisma.user.update({
            where: { id: friendId },
            data: {
                friends: { connect: { id: userId } },
            },
        })
    ]);

    sendSuccess(res, {
        message: "Friend added successfully",
        data: updatedUser,
        statusCode: 201,
    });
})

export const getFriends = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new AppError("Unauthorized access", 401, "UNAUTHORIZED");
    }

    const friends = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            friends: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    userName: true,
                    email: true,
                    profilePicture: true,
                    isOnline: true,
                }
            },
        },
    });

    sendSuccess(res, {
        message: "Friends fetched successfully",
        data: friends,
        statusCode: 200,
    });
})