import express, { Request, Response } from "express";
import cors from "cors";
import csurf from "csurf";
import cookieParser from "cookie-parser";

import v1Routes from "./api/v1/index";
import { errorHandler } from "./middleware/errorHamdler";


const csrfProtection = csurf({
  cookie: true,
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(csrfProtection);



// Versioned routes
app.use("/api/v1", v1Routes);


app.get("/", (req: Request, res: Response) => {
  res.send("Resivana Backend is running");
});

// app.use("/api/v2", v2Routes);

app.use(errorHandler)

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

export default app;
