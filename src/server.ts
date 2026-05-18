import express, { Request, Response } from "express";
import cors from "cors";
import csurf from "csurf";
import cookieParser from "cookie-parser";

import v1Routes from "./api/v1/index";
import { errorHandler } from "./middleware/errorHamdler";

const PORT = process.env.PORT || 5000;

const csrfProtection = csurf({
  cookie: true,
});

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

// Apply CSRF protection with custom error handling for initial token generation
// This middleware initializes req.csrfToken() but doesn't fail if token is invalid initially
const csrfProtectionWithBypass = csurf({
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  },
});

// Special handler for csrf-token endpoint - initialize CSRF but don't validate
app.get("/api/v1/auth/csrf-token", (req: Request, res: Response, next) => {
  csrfProtectionWithBypass(req, res, (err) => {
    // Ignore CSRF validation errors on token generation endpoint
    if (err && err.code !== "EBADCSRFTOKEN") {
      return next(err);
    }
    next();
  });
});

// Skip CSRF for OAuth endpoints
app.use((req: Request, res: Response, next) => {
  if (
    req.path.startsWith("/api/v1/auth/google") ||
    req.path.startsWith("/api/v1/auth/apple")
  ) {
    return next();
  }
  csrfProtectionWithBypass(req, res, next);
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
