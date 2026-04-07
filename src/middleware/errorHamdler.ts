import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ApiError } from "../types/api.types";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response<ApiError>,
    next: NextFunction
) => {
    // Log error for development
    console.error(" Error caught by global handler:", err);

    const isDevelopment = process.env.NODE_ENV?.includes("development");

    // specialized handling for different error types
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";
    let code = err.code || "INTERNAL_SERVER_ERROR";
    let details = err.details || null;

    // 1. Handling CSRF Errors
    if (err.code === "EBADCSRFTOKEN") {
        statusCode = 403;
        message = "Invalid or missing CSRF token";
        code = "FORBIDDEN";
    }

    // 2. Handling Prisma Errors (mapping they to semantic messages)
    if (err.name === "PrismaClientKnownRequestError") {
        switch (err.code) {
            case "P2002": // Unique constraint failed
                statusCode = 409;
                const field = err.meta?.target || "Field";
                message = `${field} already exists`;
                code = "DUPLICATE_RESOURCE";
                break;
            case "P2025": // Record not found
                statusCode = 404;
                message = "Record not found";
                code = "NOT_FOUND";
                break;
            default:
                message = isDevelopment ? err.message : "Database error";
                code = `PRISMA_${err.code}`;
        }
    }

    if (err.name === "PrismaClientValidationError") {
        statusCode = 400;
        message = isDevelopment ? err.message : "Validation error in database query";
        code = "BAD_REQUEST";
    }

    // 3. Handling custom AppErrors
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        code = err.code;
        details = err.details;
    }

    // 4. Default Fallback
    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 && !isDevelopment ? "Something went wrong" : message,
        error: {
            code,
            details,
            ...(isDevelopment && { stack: err.stack, fullError: err }),
        },
    });
};