import { Router } from "express";
import userRoutes from "./user.route";
import gameRoutes from "./game.route";
import dashboardRoutes from "./dashboard.route";
import historyRoutes from "./history.route";

const router = Router();

router.use("/user", userRoutes);
router.use("/game", gameRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/history", historyRoutes);

export default router;
