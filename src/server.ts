import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import csrf from "csurf";

import v1Routes from "./api/v1/index";
import { errorHandler } from "./middleware/errorHamdler";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/**
 * CORS
 * IMPORTANT:
 * origin MUST be your frontend domain
 */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://your-frontend-domain.vercel.app",
    ],
    credentials: true,
  }),
);

/**
 * CSRF Protection
 */
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
});

/**
 * Skip CSRF for OAuth routes if needed
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  if (
    req.path.startsWith("/api/v1/auth/google") ||
    req.path.startsWith("/api/v1/auth/apple")
  ) {
    return next();
  }

  csrfProtection(req, res, next);
});

/**
 * Generate CSRF token
 */
app.get(
  "/api/v1/auth/csrf-token",
  csrfProtection,
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      csrfToken: req.csrfToken(),
    });
  },
);

/**
 * API Routes
 */
app.use("/api/v1", v1Routes);

/**
 * Health Check
 */
app.get("/", (req: Request, res: Response) => {
  res.send("Resivana Backend is running");
});

/**
 * Global Error Handler
 */
app.use(errorHandler);

/**
 * Start Server
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
