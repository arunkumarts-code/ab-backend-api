import { Response } from "express";
import { AuthRequest } from "../middlewares/auth-middleware";

export const getUsers = (req: AuthRequest, res: Response) => {
   res.json({
      success: true,
      data: req.user.dbUser.userName || "Anonymous",
   });
};
