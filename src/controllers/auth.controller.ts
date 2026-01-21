import { Request, Response } from "express";
import admin from "../configs/firebaseAdmin.config";
import { prisma } from "../configs/prisma";

export const login = async(req: Request, res: Response) => {
   const authHeader = req.headers.authorization;

   if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing token" });
   }

   const idToken = authHeader.split(" ")[1];

   try {
      const decoded = await admin.auth().verifyIdToken(idToken, true);

      // Create or sync user in DB
      const user =await prisma.user.upsert({
         where: { firebaseUid: decoded.uid },
         update: {
            lastLoginAt: new Date(),
         },
         create: {
            firebaseUid: decoded.uid,
            userEmail: decoded.email ?? "",
            userName: decoded.name ?? "",
            lastLoginAt: new Date(),
         },
      });
      console.log("User logged in:", user);

      res.json({ success: true, message : "Login successful" });
   } catch (err) {
      console.error(err);
      res.status(401).json({ message: "Invalid or expired token" });
   }
};
