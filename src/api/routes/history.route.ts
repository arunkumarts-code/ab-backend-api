import { Router } from "express";
import { getGameById, getUserGames, getUserGamesSummary } from "../controllers/history.controller";

const router = Router();

router.get("/", getUserGames);
router.get("/summary", getUserGamesSummary);
router.get("/game/:gameId", getGameById);

export default router;