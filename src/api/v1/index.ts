import { Router } from "express";
import propertyRoutes from "./routes/property.route";
import authRoutes from "./routes/auth.route";
import { swaggerSpec, swaggerUi } from "../../config/swagger";

const router = Router();

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));



router.use("/properties", propertyRoutes);

router.use("/auth", authRoutes);

export default router;
