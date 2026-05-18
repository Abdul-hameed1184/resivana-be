import express, { Request, Response } from "express";
import cors from "cors";
import csurf from "csurf";
import cookieParser from "cookie-parser";

import v1Routes from "./api/v1/index";
import { errorHandler } from "./middleware/errorHamdler";

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://yourfrontend.vercel.app",
    ],
    credentials: true,
  }),
);

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  },
});

app.use(csrfProtection);

app.get("/api/v1/auth/csrf-token", (req, res) => {
  res.json({
    csrfToken: req.csrfToken(),
  });
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
