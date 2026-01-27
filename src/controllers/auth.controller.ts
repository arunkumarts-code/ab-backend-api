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
      const provider = decoded.firebase?.sign_in_provider ?? "password";

      if (!decoded.email) {
         return res.status(400).json({ message: "Email not found in token" });
      }

      const fallbackName =
         decoded.name ??
         decoded.email
            .split("@")[0]
            .replace(/[._]/g, " ")
            .replace(/\b\w/g, c => c.toUpperCase());

      // Create or sync user in DB
      const user =await prisma.user.upsert({
         where: { firebaseUid: decoded.uid },
         update: {
            lastLoginAt: new Date(),
            provider,
         },
         create: {
            firebaseUid: decoded.uid,
            userEmail: decoded.email,
            userAvatar: "/avatar-images/74.png",
            firstName: fallbackName,
            lastLoginAt: new Date(),
            provider,
         },
      });
      console.log("User logged in:", user);

      res.json({
         success: true,
         message: "Login successful",
         data: {
            userEmail: user.userEmail,
            firstName: user.firstName,
            lastName: user.lastName,
            userAvatar: user.userAvatar,
            userNickName: user.userNickName,
            provider: user.provider,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
         },
      });
   } catch (err) {
      console.error(err);
      res.status(401).json({ message: "Invalid or expired token" });
   }
};
