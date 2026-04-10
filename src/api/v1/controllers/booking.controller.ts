import { AppError } from "../../../utils/AppError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { sendSuccess } from "../../../utils/response";
import { BookingStatus } from "../../../generated/prisma/enums";

export const scheduleBooking = asyncHandler(async (req: Request, res: Response) => {
    const { properyId, date } = req.body;

    if (!properyId || !date) throw new AppError("Property ID and date are required", 400, "BAD_REQUEST");

    const userId = req.user?.id;
    if (!userId) {
        throw new AppError("Unauthorized access", 401, "UNAUTHORIZED");
    }

    const property = await prisma.property.findUnique({ where: { id: properyId } });
    if (!property) throw new AppError("Property not found", 404, "NOT_FOUND");

    //prevent double booking

    const existingBooking = await prisma.booking.findFirst({
        where: {
            propertyId: properyId,
            date,
            customerId: userId,
        },
    });
    if (existingBooking) throw new AppError("You already have a booking for this property on this date", 400, "BAD_REQUEST");


    const booking = await prisma.booking.create({
        data: {
            propertyId: properyId,
            agentId: property.agentId,
            customerId: userId,
            date,
        },
    });

    sendSuccess(res, {
        message: "Booking scheduled successfully",
        data: booking,
        statusCode: 201,
    });
})

export const getBookings = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new AppError("Unauthorized access", 401, "UNAUTHORIZED");
    }

    const bookings = await prisma.booking.findMany({
        where: {
            customerId: userId,
        },
        include: {
            property: true,
            agent: true,
        },
    });

    sendSuccess(res, {
        message: "Bookings fetched successfully",
        data: bookings,
        statusCode: 200,
    });
})

export const updateBooking = asyncHandler(async (req: Request, res: Response) => {
    
    const bookingId = req.params.bookingId as string;
    const status = req.params.status as string;

    if (!Object.values(BookingStatus).includes(status as BookingStatus)) {
        throw new AppError(`Invalid status. Must be one of: ${Object.values(BookingStatus).join(', ')}`, 400, "BAD_REQUEST");
    }

    if (!bookingId || !status) throw new AppError("Booking ID and status are required", 400, "BAD_REQUEST");

    const userId = req.user?.id;

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");
    if (userId !== booking.agentId) {
        throw new AppError("Unauthorized access", 401, "UNAUTHORIZED");
    }

    const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: status as BookingStatus },
    });

    sendSuccess(res, {
        message: "Booking updated successfully",
        data: updatedBooking,
        statusCode: 200,
    });
})

export const deleteBooking = asyncHandler(async (req: Request, res: Response) => {
    const bookingId = req.params.bookingId as string;
    if (!bookingId) throw new AppError("Booking ID is required", 400, "BAD_REQUEST");

    const userId = req.user?.id;
    if (!userId) {
        throw new AppError("Unauthorized access", 401, "UNAUTHORIZED");
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");
    if (userId !== booking.customerId) {
        throw new AppError("Unauthorized access", 401, "UNAUTHORIZED");
    }

    const deletedBooking = await prisma.booking.delete({
        where: { id: bookingId },
    });

    sendSuccess(res, {
        message: "Booking deleted successfully",
        data: deletedBooking,
        statusCode: 200,
    });
})