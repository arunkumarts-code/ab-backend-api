import { Router } from "express";
import userRoutes from "./user.route";
import gameRoutes from "./game.route";
import dashboardRoutes from "./dashboard.route";

const router = Router();

router.use("/user", userRoutes);
router.use("/game", gameRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
