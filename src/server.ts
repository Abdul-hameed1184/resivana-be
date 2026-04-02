import express from "express";
import cors from "cors";

import v1Routes from "./api/v1/routes/index";

const app = express();

app.use(cors());
app.use(express.json());

// Versioned routes
app.use("/api/v1", v1Routes);
app.get("/", (req, res) => {
  res.send("Welcome to the Resivana API!");
});
// app.use("/api/v2", v2Routes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
})

export default app;
