import { Router } from "express";
import propertyRoutes from "./property.route";

const router = Router();

router.use("/properties", propertyRoutes);

export default router;
