import { Router } from "express";
import { addHand, getGameResults, newGame, skipHand, undoHand } from "../controllers/game.controller";

const router = Router();

router.get("/results", getGameResults);            
router.post("/new", newGame);                
router.post("/add", addHand);             
router.post("/undo", undoHand);     
router.post("/skip", skipHand);  

export default router;