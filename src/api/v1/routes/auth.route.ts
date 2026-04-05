import { Router } from "express";

const router = Router();

/* 
TODO: 
- Implement login
- Implement signup
- Implement logout
- Implement refresh
- Implement forgot password
- Implement reset password
- Implement verify email
- Implement change password
- Implement change profile picture
- Implement delete profile
 */


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
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", (req, res) => {
    res.send("Login");
});

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
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *               city: { type: string }
 *               state: { type: string }
 *               zip: { type: string }
 *               country: { type: string }
 *               profilePicture: { type: string }
 *             required:
 *               - email
 *               - password
 *               - name
 *               - phone
 *               - address
 *               - city
 *               - state
 *               - zip
 *               - country
 *               - profilePicture
 *     responses:
 *       200:
 *         description: Signup successful
 */
router.post("/signup", (req, res) => {
    res.send("Signup");
});

router.post("/logout", (req, res) => {
    res.send("Logout");
});

router.post("/refresh", (req, res) => {
    res.send("Refresh");
});

router.post("/forgot-password", (req, res) => {
    res.send("Forgot Password");
});

router.post("/reset-password", (req, res) => {
    res.send("Reset Password");
});


export default router;