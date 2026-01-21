import { Router } from "express";
import routes from "../routes";
import { authMiddleware } from "./auth-middleware";
import authRoutes from "../routes/auth.routes";

const router = Router();

// Public auth routes
router.use("/api/auth", authRoutes);

// Protected routes
router.use("/api", authMiddleware, routes);

export default router;
