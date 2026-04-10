import { AppError } from "../../../utils/AppError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { sendSuccess } from "../../../utils/response";

export const addReview = asyncHandler(async (req: Request, res: Response) => {
    const { propertyId, rating, comment, } = req.body;
    if (!propertyId || !rating || !comment) throw new AppError("Property ID, rating and comment are required", 400, "BAD_REQUEST");

    if(rating < 1 || rating > 5) throw new AppError("Rating must be between 1 and 5", 400, "BAD_REQUEST");

    const userId = req.user?.id;
    if (!userId) {
        throw new AppError("Unauthorized access", 401, "UNAUTHORIZED");
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new AppError("Property not found", 404, "NOT_FOUND");

    const review = await prisma.review.create({
        data: {
            propertyId,
            userId,
            rating,
            comment,
        },
    });

    sendSuccess(res, {
        message: "Review added successfully",
        data: review,
        statusCode: 201,
    });
})

export const getPropertyReviews = asyncHandler(async (req: Request, res: Response) => {
    const propertyId = req.params.propertyId as string;
    if (!propertyId) throw new AppError("Property ID is required", 400, "BAD_REQUEST");

    const reviews = await prisma.review.findMany({ where: { propertyId } });
    sendSuccess(res, {
        message: "Reviews fetched successfully",
        data: reviews,
        statusCode: 200,
    });
})

export const getAgentReviews = asyncHandler(async (req: Request, res: Response) => {
    const agentId = req.params.agentId as string;
    if (!agentId) throw new AppError("Agent ID is required", 400, "BAD_REQUEST");

    const reviews = await prisma.review.findMany({ where: { property: { agentId } } });
    sendSuccess(res, {
        message: "Reviews fetched successfully",
        data: reviews,
        statusCode: 200,
    });
})

export const editReview = asyncHandler(async (req: Request, res: Response) => {
    const { reviewId, rating, comment } = req.body;
    if (!reviewId || !rating || !comment) throw new AppError("Review ID, rating and comment are required", 400, "BAD_REQUEST");

    const userId = req.user?.id;
    if (!userId) {
        throw new AppError("Unauthorized access", 401, "UNAUTHORIZED");
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new AppError("Review not found", 404, "NOT_FOUND");

    if (review.userId !== userId) throw new AppError("Unauthorized access", 401, "UNAUTHORIZED");

    const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
            rating,
            comment,
        },
    });

    sendSuccess(res, {
        message: "Review updated successfully",
        data: updatedReview,
        statusCode: 200,
    });
})

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
    const reviewId = req.params.reviewId as string;
    if (!reviewId) throw new AppError("Review ID is required", 400, "BAD_REQUEST");

    const userId = req.user?.id;
    if (!userId) {
        throw new AppError("Unauthorized access", 401, "UNAUTHORIZED");
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new AppError("Review not found", 404, "NOT_FOUND");

    if (review.userId !== userId) throw new AppError("Unauthorized access", 401, "UNAUTHORIZED");

    await prisma.review.delete({ where: { id: reviewId } });

    sendSuccess(res, {
        message: "Review deleted successfully",
        statusCode: 200,
        data: null,
    });
})