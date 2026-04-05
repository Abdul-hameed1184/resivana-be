import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ApiError } from "../types/api.types";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response<ApiError>,
    next: NextFunction
) => {
    console.error(err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: {
                code: err.code,
                details: err.details,
            },
        });
    }

    // fallback (unknown errors)
    return res.status(500).json({
        success: false,
        message: "Something went wrong",
        error: {
            code: "INTERNAL_SERVER_ERROR",
        },
    });
};