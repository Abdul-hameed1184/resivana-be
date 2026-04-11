import { Router } from "express";
import propertyRoutes from "./routes/property.route";
import authRoutes from "./routes/auth.route";
import conversationRoutes from "./routes/conversation.route";
import messageRoutes from "./routes/message.route";
import bookingRoutes from "./routes/booking.route";
import reviewRoutes from "./routes/review.route";
import friendsRoutes from "./routes/friends.route";
import { swaggerSpec, swaggerUi } from "../../config/swagger";
import { protect } from "./middleware/auth.middleware";

const router = Router();

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

router.use("/auth", authRoutes);
router.use("/properties", propertyRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);
router.use("/bookings", protect, bookingRoutes);
router.use("/reviews", protect, reviewRoutes);
router.use("/friends", protect, friendsRoutes);

export default router;
