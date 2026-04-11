import { Router } from "express";
import propertyRoutes from "./routes/property.route";
import authRoutes from "./routes/auth.route";
import conversationRoutes from "./routes/conversation.route";
import messageRoutes from "./routes/message.route";
import { swaggerSpec, swaggerUi } from "../../config/swagger";

const router = Router();

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));



router.use("/properties", propertyRoutes);

router.use("/auth", authRoutes);

router.use("/conversations", conversationRoutes);

router.use("/messages", messageRoutes);

export default router;
