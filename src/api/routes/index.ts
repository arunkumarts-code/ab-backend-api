import { Router } from "express";
import userRoutes from "./user.route";
import gameRoutes from "./game.route";

const router = Router();

router.use("/user", userRoutes);
router.use("/game", gameRoutes);

export default router;
