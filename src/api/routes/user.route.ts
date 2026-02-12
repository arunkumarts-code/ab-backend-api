import { Router } from "express";
import { getProfile, updateProfile, deleteProfile, updateAvatar } from "../controllers/user.controller";

const router = Router();

router.get("/", getProfile);
router.put("/avatar", updateAvatar);
router.put("/", updateProfile);
router.delete("/", deleteProfile);

export default router;