import { Router } from "express";
import { getProfile, updateProfile, deleteProfile } from "../controllers/user.controller";

const router = Router();

router.get("/", getProfile);
router.put("/", updateProfile);
router.delete("/", deleteProfile);

export default router;