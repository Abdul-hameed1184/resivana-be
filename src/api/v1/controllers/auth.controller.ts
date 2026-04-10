import crypto from "crypto";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { generateTokens } from "../../../utils/token";
import { prisma } from "../../../lib/prisma";
import jwt, { VerifyErrors, JwtPayload } from "jsonwebtoken";
import { AppError } from "../../../utils/AppError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendSuccess } from "../../../utils/response";
import { sendEmail } from "../../../services/email.service";
import { generateOtp } from "../../../utils/otp";
import { OtpType } from "../../../generated/prisma/enums";
import { otpTemplate } from "../../../templates/otpTemplate";
import cloudinary from "../../../config/Cloudinary";
import { OAuth2Client } from "google-auth-library";
import appleSignin from "apple-signin-auth";


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


export const login = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) throw new AppError("Password is incorrect", 401, "AUTH_INVALID");

        const sessionId = crypto.randomUUID();
        const { accessToken, refreshToken } = generateTokens(user.email, user.role, sessionId);
        const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

        // Store refresh token in separated table
        await prisma.refreshToken.create({
            data: {
                id: sessionId,
                token: hashedToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        sendSuccess(res, {
            message: "Login successful",
            data: { accessToken, user },
            statusCode: 200,
        });
    } catch (error: any) {
        console.error("Login error:", error);
        throw new AppError(error.message || "Internal server error", error.statusCode || 500, error.code || "INTERNAL_SERVER_ERROR");
    }
});

export const signup = asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, userName, email, password } = req.body;

    const requiredFields = ["firstName", "lastName", "email", "password"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (!firstName || !lastName || !email || !password) {
        throw new AppError(missingFields.join(", ") + " are required", 400, "BAD_REQUEST");
    }

    // check if user exists outside transaction for efficiency
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new AppError("User already exists", 400, "USER_ALREADY_EXISTS", { missingFields: [] });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Start transaction for user creation and OTP
        const result = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    userName,
                },
            });

            const { otp, hashedOtp } = await generateOtp();

            await tx.oTP.create({
                data: {
                    userId: newUser.id,
                    code: hashedOtp,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                    otpType: OtpType.EMAIL_VERIFY,
                },
            });

            const emailContent = otpTemplate({
                name: newUser.firstName,
                otp,
                type: "VERIFY_EMAIL",
                expiryMinutes: 10,
            });

            // Send email within transaction
            // If this fails, the user record will NOT be committed!
            await sendEmail({
                to: newUser.email,
                subject: "Verify your email",
                html: emailContent
            });

            return newUser;
        });

        sendSuccess(res, {
            message: "User created successfully, please verify your email",
            data: result,
            statusCode: 201,
        });

    } catch (error: any) {
        console.error("Signup process failed:", error);

        // Handle specific technical errors with clear messages
        if (error.code === 'ESOCKET' || error.syscall === 'connect') {
            throw new AppError("Failed to send verification email. The account was not created. Please try again later.", 503, "SERVICE_UNAVAILABLE");
        }

        // Re-throw AppErrors or other known errors
        if (error instanceof AppError) throw error;

        throw new AppError(error.message || "Signup failed", error.statusCode || 500, error.code || "INTERNAL_SERVER_ERROR");
    }
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    if (!email || !otp) throw new AppError("Email and OTP are required", 400, "BAD_REQUEST");

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
    if (user.isEmailVerified === true) throw new AppError("User is verified already", 400, "VERIFIED_ALREADY")
    const otpRecords = await prisma.oTP.findMany({
        where: {
            userId: user.id,
            otpType: OtpType.EMAIL_VERIFY,
            expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: "desc" },
    });

    let validOtpRecord = null;
    for (const record of otpRecords) {
        const isMatch = await bcrypt.compare(otp, record.code);
        if (isMatch) {
            validOtpRecord = record;
            break;
        }
    }

    if (!validOtpRecord) throw new AppError("Invalid or expired OTP", 400, "INVALID_OTP");

    await prisma.user.update({
        where: { email: user.email },
        data: { isEmailVerified: true },
    });
    await prisma.oTP.delete({
        where: { id: validOtpRecord.id },
    });
    sendSuccess(res, {
        message: "Email verified successfully",
        data: null,
        statusCode: 200,
    });
});

export const resendEmailVerificationOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) throw new AppError("Email is required", 400, "BAD_REQUEST");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
    const { otp, hashedOtp } = await generateOtp();
    await prisma.oTP.create({
        data: {
            userId: user.id,
            code: hashedOtp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            otpType: OtpType.EMAIL_VERIFY,
        },
    });
    const emailContent = otpTemplate({
        name: user.firstName,
        otp,
        type: "VERIFY_EMAIL",
        expiryMinutes: 10,
    });
    await sendEmail({
        to: user.email,
        subject: "Verify your email",
        html: emailContent
    });
    sendSuccess(res, {
        message: "OTP resent successfully",
        data: null,
        statusCode: 200,
    });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
    const { otp, hashedOtp } = await generateOtp();
    await prisma.oTP.create({
        data: {
            userId: user.id,
            code: hashedOtp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            otpType: OtpType.PASSWORD_RESET,
        },
    });
    const emailContent = otpTemplate({
        name: user.firstName,
        otp,
        type: "PASSWORD_RESET",
        expiryMinutes: 10,
    });
    await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: emailContent
    });
    sendSuccess(res, {
        message: "OTP sent successfully",
        data: null,
        statusCode: 200,
    });
});

export const verifyForgotPasswordOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    if (!email || !otp) throw new AppError("Email and OTP are required", 400, "BAD_REQUEST");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
    const otpRecords = await prisma.oTP.findMany({
        where: {
            userId: user.id,
            otpType: OtpType.PASSWORD_RESET,
            expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: "desc" },
    });

    let validOtpRecord = null;
    for (const record of otpRecords) {
        const isMatch = await bcrypt.compare(otp, record.code);
        if (isMatch) {
            validOtpRecord = record;
            break;
        }
    }

    if (!validOtpRecord) throw new AppError("Invalid or expired OTP", 400, "INVALID_OTP");

    await prisma.oTP.delete({
        where: { id: validOtpRecord.id },
    });
    sendSuccess(res, {
        message: "Otp verified successfully",
        data: null,
        statusCode: 200,
    });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
        where: { email: user.email },
        data: { password: hashedPassword },
    });
    sendSuccess(res, {
        message: "Password reset successful",
        data: null,
        statusCode: 200,
    });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.sendStatus(204); // No content
    const refreshToken = cookies.refreshToken;

    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Delete refresh token from database
    await prisma.refreshToken.deleteMany({
        where: { token: hashedToken },
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
    });

    sendSuccess(res, {
        message: "Logout successful",
        data: null,
        statusCode: 200,
    });
});

export const handleRefreshToken = asyncHandler(async (req: Request, res: Response) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.sendStatus(401);
    console.log(req.cookies)
    const refreshToken = cookies.refreshToken;
    res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'strict',
        secure: true
    });
    console.log("after: ", req.cookies)
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // 1. Find token in database
    const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: hashedToken },
        include: { user: true },
    });

    // 2. Detect Refresh Token Reuse (Hacker scenario)
    if (!tokenRecord) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as any;

            // If the token is valid but not in DB, it was likely reused by an attacker
            // Security measure: invalidate ALL sessions for this user
            const userToInvalidate = await prisma.user.findUnique({ where: { email: decoded.UserInfo.email } });
            if (userToInvalidate) {
                await prisma.refreshToken.deleteMany({
                    where: { userId: userToInvalidate.id }
                });
                console.warn(`⚠️ Potential refresh token reuse detected for ${decoded.UserInfo.email}. All sessions cleared.`);
            }
        } catch (err) {
            // Token is either invalid or already handled (expired/cleared)
        }
        throw new AppError("Invalid credentials", 403, "FORBIDDEN");
    }

    if (tokenRecord.revoked) {
        await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
        throw new AppError("Token has been revoked", 403, "FORBIDDEN");
    }

    const user = tokenRecord.user;

    // 3. Evaluate JWT and expiration
    let decoded: any;
    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string);
        if (user.email !== decoded.UserInfo.email) throw new Error();
        if (tokenRecord.expiresAt < new Date()) throw new Error("Token expired");
    } catch (err) {
        // Token is expired or invalid
        await prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revoked: true, expiresAt: new Date() }
        });
        await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
        throw new AppError("Invalid credentials", 403, "FORBIDDEN");
    }

    // "first of all expire the current token adn then revoke it then delete it before issueing a new access token adn refreshtoken"
    await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { expiresAt: new Date() }
    });

    await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true }
    });

    await prisma.refreshToken.delete({
        where: { id: tokenRecord.id }
    });

    // 4. Issue New Tokens (Rotation)
    const newSessionId = crypto.randomUUID();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.email, user.role, newSessionId);
    const newHashedToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    // 5. Store the new token record
    await prisma.refreshToken.create({
        data: {
            id: newSessionId,
            token: newHashedToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
    });

    // 6. Send new refresh token as a secure cookie
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, {
        message: "Session refreshed successfully",
        data: { accessToken, user },
        statusCode: 200,
    });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) throw new AppError("Invalid old password", 400, "INVALID_PASSWORD");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { email: user.email },
        data: { password: hashedPassword },
    });

    sendSuccess(res, {
        message: "Password changed successfully",
        data: null,
        statusCode: 200,
    });
});

export const updateUserProfilePicture = asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) throw new AppError("No file uploaded", 400, "BAD_REQUEST");

    if (!req.user?.email) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

    // delete old profile picture from cloudinary
    if (user.profilePicture && user.profilePicture.length > 0) {
        try {
            const oldPublicId = user.profilePicture.split("/").pop()?.split(".")[0];
            if (oldPublicId) {
                await cloudinary.uploader.destroy(`profile_pics/${oldPublicId}`);
                console.log("Deleted previous profile picture:", oldPublicId);
            }
        } catch (deleteError: any) {
            console.error("❌ Error deleting old image from Cloudinary:", deleteError.message);
        }
    }

    // Upload new image to Cloudinary
    const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: "profile_pics" },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    reject(error);
                } else {
                    console.log("Cloudinary Upload Successful:", result?.secure_url);
                    resolve(result);
                }
            }
        ).end(file.buffer);
    });

    const profilePicture = uploadResult.secure_url;

    const updatedUser = await prisma.user.update({
        where: { email: user.email },
        data: { profilePicture },
    });

    sendSuccess(res, {
        message: "Profile picture updated successfully",
        data: updatedUser,
        statusCode: 200,
    });
});

export const getCsrfToken = (req: Request, res: Response) => {
    sendSuccess(res, {
        message: "CSRF token generated successfully",
        data: { csrfToken: req.csrfToken() },
        statusCode: 200,
    });
};

export const checkAuth = asyncHandler(async (req: Request, res: Response) => {
    try {
        sendSuccess(res, {
            message: "User authenticated successfully",
            data: req.user,
            statusCode: 200,
        });
    } catch (error: any) {
        throw new AppError(error.message, 500, "INTERNAL_SERVER_ERROR");
    }
});

export const googleAuth = asyncHandler(async (req, res) => {
    const { idToken } = req.body;

    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) throw new AppError("Invalid Google token", 401);

    const { email, sub, given_name, family_name } = payload;

    if (!email || !sub || !given_name || !family_name) {
        throw new AppError("Missing required fields from Google token", 400, "BAD_REQUEST");
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        if (user.provider && user.provider !== "google") {
            throw new AppError("Account exists with different provider", 400, "PROVIDER_MISMATCH");
        }
    } else {
        const dummyPassword = await bcrypt.hash(crypto.randomUUID(), 10);
        user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                firstName: given_name,
                lastName: family_name,
                password: dummyPassword,
                provider: "google",
                providerId: sub,
                isEmailVerified: true,
            },
        });
    }

    const sessionId = crypto.randomUUID();
    const { accessToken, refreshToken } = generateTokens(user.email, user.role, sessionId);
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // store refresh token (same as your login flow)
    await prisma.refreshToken.create({
        data: {
            id: sessionId,
            token: hashedToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, {
        message: "Google login successful",
        data: { accessToken, user },
        statusCode: 200,
    });
});

export const appleAuth = asyncHandler(async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        throw new AppError("Apple token is required", 400, "BAD_REQUEST");
    }

    // ✅ Verify Apple token
    const appleUser = await appleSignin.verifyIdToken(idToken, {
        audience: process.env.APPLE_CLIENT_ID,
        ignoreExpiration: false,
    });

    if (!appleUser) {
        throw new AppError("Invalid Apple token", 401, "UNAUTHORIZED");
    }

    const { email, sub } = appleUser;

    // ⚠️ email might be missing after first login
    if (!email) {
        throw new AppError("Apple did not return email", 400);
    }

    // ✅ Find or create user
    let user = await prisma.user.findUnique({ where: { email } });


    // ⚠️ prevent provider conflict
    if (user && user.provider && user.provider !== "apple") {
        throw new AppError("Account exists with different provider", 400, "PROVIDER_MISMATCH");
    }


    if (!user) {
        const dummyPassword = await bcrypt.hash(crypto.randomUUID(), 10);
        const namePrefix = email.split('@')[0] || "Apple";
        user = await prisma.user.create({
            data: {
                email,
                firstName: namePrefix,
                lastName: "User",
                password: dummyPassword,
                provider: "apple",
                providerId: sub,
                isEmailVerified: true,
            },
        });
    }


    const sessionId = crypto.randomUUID();
    const { accessToken, refreshToken } = generateTokens(user.email, user.role, sessionId);
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await prisma.refreshToken.create({
        data: {
            id: sessionId,
            token: hashedToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });

    sendSuccess(res, {
        message: "Apple login successful",
        data: { accessToken, user },
        statusCode: 200,
    });
});