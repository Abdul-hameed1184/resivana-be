import jwt = require("jsonwebtoken");
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config/env.config";

export const generateTokens = (email: string, role: string, sessionId: string) => {
    const accessToken = jwt.sign({
        UserInfo: {
            email,
            role,
            sessionId
        },
    }, ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });
    const refreshToken = jwt.sign({
        UserInfo: {
            email,
            role,
            sessionId
        },
    }, REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
    return { accessToken, refreshToken };
};
