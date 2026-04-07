import { Response } from "express";
import { ApiSuccess, Meta } from "../types/api.types";

export const sendSuccess = <T>(
    res: Response,
    {
        message,
        data,
        meta,
        statusCode = 200,
    }: {
        message: string;
        data: T;
        meta?: Meta;
        statusCode?: number;
    }
): Response<ApiSuccess<T>> => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        ...(meta && { meta }), // only include if exists
    });
};