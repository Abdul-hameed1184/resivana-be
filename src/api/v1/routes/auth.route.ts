import { Router } from "express";
import { 
    login, 
    signup, 
    logout, 
    handleRefreshToken, 
    forgotPassword, 
    resetPassword, 
    verifyEmail, 
    changePassword, 
    updateUserProfilePicture,
    resendEmailVerificationOtp,
    verifyForgotPasswordOtp,
    checkAuth,
    getCsrfToken,
    googleAuth,
    appleAuth
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";
import { upload } from "../../../middleware/upload";

const router = Router();

/**
 * @swagger
 * /api/v1/auth/csrf-token:
 *   get:
 *     summary: Get CSRF token
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: CSRF token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrfToken: { type: string }
 */
router.get("/csrf-token", getCsrfToken);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *             required:
 *               - email
 *               - password
 *     security:
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", login);

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Signup
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               userName: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *     security:
 *       - csrfToken: []
 *     responses:
 *       201:
 *         description: Signup successful
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
router.post("/signup", signup);

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   post:
 *     summary: Verify email
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               otp: { type: string }
 *             required:
 *               - email
 *               - otp
 *     security:
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired otp
 *       404:
 *         description: User not found
 */
router.post("/verify-email", verifyEmail);

/**
 * @swagger
 * /api/v1/auth/resend-verify-email:
 *   post:
 *     summary: Resend email verification OTP
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *             required:
 *               - email
 *     security:
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/resend-verify-email", resendEmailVerificationOtp);

/** 
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags:
 *       - Auth
 *     security:
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   get:
 *     summary: Refresh access token
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Refresh token generated successfully
 *       403:
 *         description: Forbidden (invalid or reused refresh token)
 */
router.get("/refresh", handleRefreshToken);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *             required:
 *               - email
 *     security:
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/v1/auth/verify-forgot-password:
 *   post:
 *     summary: Verify password reset OTP
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               otp: { type: string }
 *             required:
 *               - email
 *               - otp
 *     security:
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Otp verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-forgot-password", verifyForgotPasswordOtp);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *             required:
 *               - email
 *               - password
 *     security:
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Password reset successful
 *       404:
 *         description: User not found
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   patch:
 *     summary: Change user password
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               oldPassword: { type: string }
 *               newPassword: { type: string }
 *             required:
 *               - email
 *               - oldPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid old password
 *       401:
 *         description: Unauthorized
 */
router.patch("/change-password", protect, changePassword);

/**
 * @swagger
 * /api/v1/auth/profile-picture:
 *   patch:
 *     summary: Update user profile picture
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 */
router.patch("/profile-picture", protect, upload.single("profilePicture"), updateUserProfilePicture);

/**
 * @swagger
 * /api/v1/auth/check-auth:
 *   get:
 *     summary: Check authentication status
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/check-auth", protect, checkAuth);

/**
 * @swagger
 * /api/v1/auth/google:
 *   post:
 *     summary: Google authentication
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idToken: { type: string }
 *             required:
 *               - idToken
 *     security:
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Google authentication successful
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/google", googleAuth);

/**
 * @swagger
 * /api/v1/auth/apple:
 *   post:
 *     summary: Apple authentication
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idToken: { type: string }
 *             required:
 *               - idToken
 *     security:
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Apple authentication successful
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/apple", appleAuth);

export default router;
