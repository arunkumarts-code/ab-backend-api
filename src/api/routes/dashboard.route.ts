import { Router } from "express";
import { getLiveWins, getProfitGraph, getTop10Players } from "../controllers/dashboard.controller";

const router = Router();

router.get("/profit/:type", getProfitGraph);            
router.get("/top10/:type", getTop10Players);            
router.get("/live-wins", getLiveWins);            
 

export default router;