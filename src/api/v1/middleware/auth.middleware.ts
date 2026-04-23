import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../lib/prisma";
import jwt from "jsonwebtoken";
import { AppError } from "../../../utils/AppError";
import { ACCESS_TOKEN_SECRET } from "../../../config/env.config";

interface AuthPayload {
    UserInfo: {
        email: string;
        role: string;
        sessionId: string;
    };
}

export const protect = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        let token: string | undefined;

        // ✅ Extract token
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            throw new AppError(
                "Not authorized to access this route",
                401,
                "UNAUTHORIZED"
            );
        }

        let decoded: AuthPayload;

        try {
            decoded = jwt.verify(
                token,
                ACCESS_TOKEN_SECRET
            ) as AuthPayload;
        } catch (err: any) {
            if (err.name === "TokenExpiredError") {
                throw new AppError("Token expired", 401, "TOKEN_EXPIRED");
            }

            throw new AppError("Invalid token", 401, "INVALID_TOKEN");
        }

        // ✅ Check if session exists and is not revoked
        const session = await prisma.refreshToken.findUnique({
            where: { id: decoded.UserInfo.sessionId }
        });

        if (!session) {
            throw new AppError("Session expired or removed. Please log in again.", 401, "UNAUTHORIZED");
        }
        
        if (session.revoked) {
            throw new AppError("Session revoked. Please log in again.", 401, "UNAUTHORIZED");
        }

        const user = await prisma.user.findUnique({
            where: { email: decoded.UserInfo.email }
        });

        if (!user) {
            throw new AppError("User not found", 404, "NOT_FOUND");
        }
        // ✅ attach to request
        req.user = user;
        next();
    }
);

/**
 * ✅ Middleware to restrict access to certain roles
 * Must be used AFTER the protect middleware
 */
export const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new AppError(
                "You do not have permission to perform this action",
                403,
                "FORBIDDEN"
            );
        }
        next();
    };
};