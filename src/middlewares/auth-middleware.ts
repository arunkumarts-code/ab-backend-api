import { Request, Response, NextFunction } from "express";
import admin from "../configs/firebaseAdmin.config";
import { prisma } from "../configs/prisma";

export interface AuthRequest extends Request {
   user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
   try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
         return res.status(401).json({ message: "Unauthorized missing authorization token." });
      }

      const token = authHeader.split(" ")[1];
   
      const decodedToken = await admin.auth().verifyIdToken(token);
      const firebaseUid = decodedToken.uid;

      const user = await prisma.user.findUnique({
         where: { firebaseUid },
      });

      if (!user) {
         return res.status(401).json({ message: "User not registered" });
      }

      if (!user.isActive) {
         return res.status(401).json({ message: "User account is inactive" });
      }

      req.user = {
         fbUser: decodedToken,
         dbUser: user,
      };
      next();
   } catch {
      return res.status(401).json({ message: "Unauthorized" });
   }
};
