import { Router } from "express";
// import { getProperties } from "../controllers/property.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/properties:
 *   get:
 *     summary: Get all properties
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get("/", (req, res) => {
  res.send("List of properties will be here");
});

export default router;
