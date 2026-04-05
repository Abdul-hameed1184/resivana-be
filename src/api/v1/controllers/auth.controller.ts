import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { generateTokens } from "../../../utils/token";
import { prisma } from "../../../lib/prisma";
import jwt, { VerifyErrors, JwtPayload } from "jsonwebtoken";
import { AppError } from "../../../utils/AppError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendSuccess } from "../../../utils/response";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const { accessToken, refreshToken } = generateTokens(user.id);
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ accessToken, user });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const signup = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, userName, email, password } = req.body;

        const requiredFields = ["firstName", "lastName", "email", "password"];
        const missingFields = requiredFields.filter((field) => !req.body[field]);

        if (!firstName || !lastName || !email || !password) {
            throw new AppError("All fields are required", 400, "BAD_REQUEST");
        }

        // check if user exist
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) throw new AppError("User already exists", 400, "USER_ALREADY_EXISTS", { missingFields });

        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                username,
            },
        });

        // initate email
        

        sendSuccess(res, {
            message: "User created successfully verify email ",
            data: newUser,
            statusCode: 201,
        });

    } catch (error) {
        console.error("Signup error:", error);
        throw new AppError("Internal server error", 500, "INTERNAL_SERVER_ERROR");
    }
};


export const handleRefreshToken = asyncHandler(async (req: Request, res: Response) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'strict',
        secure: true
    })

    // find user by refresh token
    const foundUser = await prisma.user.findFirst({
        where: {
            refreshTokens: {
                has: refreshToken,
            },
        },
    });

    // detect refresh token reuse 
    if (!foundUser) {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, (err, decoded) => {
            if (err) {
                throw new AppError("Invalid credentials", 403, "FORBIDDEN");
            }
            const hackedUser = prisma.user.findUnique({ where: { email: decoded.email } });
            if (!hackedUser) {
                throw new AppError("Invalid credentials", 401, "AUTH_INVALID");
            }
            prisma.user.update({ where: { email: decoded.email }, data: { refreshTokens: [] } });
        })
        throw new AppError("Invalid credentials", 403, "FORBIDDEN");
    }

    const newRefreshTokenArray = foundUser.refreshTokens.filter(rt => rt !== refreshToken);

    // evaluate jwt
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, async (err: VerifyErrors | null, decoded: JwtPayload) => {
        if (err) {
            // refresh token expired
            foundUser.refreshTokens = newRefreshTokenArray;
            await prisma.user.update({ where: { email: foundUser.email }, data: { refreshTokens: newRefreshTokenArray } });
            throw new AppError("Invalid credentials", 403, "FORBIDDEN");
        }
        if (foundUser.email !== decoded.email) throw new AppError("Invalid credentials", 403, "FORBIDDEN");

        // refresh token is still valid
        const role = foundUser.role;
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    email: decoded.email,
                    role: role,
                },
            },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "30s" }
        );
        const newRefreshToken = generateTokens(foundUser.email, foundUser.role).refreshToken;

        foundUser.refreshTokens = [...newRefreshTokenArray, newRefreshToken];
        await prisma.user.update({ where: { email: foundUser.email }, data: { refreshTokens: foundUser.refreshTokens } });

        // save refresh token
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        sendSuccess(res, {
            message: "Refresh token generated successfully",
            data: { accessToken },
            statusCode: 200,
        });
    });
})