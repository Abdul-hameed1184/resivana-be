import express, { Request, Response } from "express";
import cors from "cors";
import csurf from "csurf";
import cookieParser from "cookie-parser";

import v1Routes from "./api/v1/index";
import { errorHandler } from "./middleware/errorHamdler";

const PORT = process.env.PORT || 5000;

const app = express();

app.use(
  cors({
    origin: [`http://localhost:3000`, "https://resivana-be.onrender.com"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// Create CSRF protection middleware with proper configuration for cross-origin
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' for cross-origin production, 'lax' for dev
  },
});

// GET endpoint to retrieve CSRF token - no validation required here
app.get(
  "/api/v1/auth/csrf-token",
  csrfProtection,
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "CSRF token generated successfully",
      data: { csrfToken: req.csrfToken() },
      statusCode: 200,
    });
  },
);

// Apply CSRF protection to all routes except the ones that don't need it
app.use((req: Request, res: Response, next) => {
  // Skip CSRF protection for:
  // 1. GET requests (they are read-only)
  // 2. OAuth endpoints (they have their own security)
  if (
    req.method === "GET" ||
    req.path.startsWith("/api/v1/auth/google") ||
    req.path.startsWith("/api/v1/auth/apple")
  ) {
    return next();
  }
  csrfProtection(req, res, next);
});

// Versioned routes
app.use("/api/v1", v1Routes);

app.get("/", (req: Request, res: Response) => {
  res.send("Resivana Backend is running");
});

// app.use("/api/v2", v2Routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
