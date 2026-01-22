import { Response } from "express";
import { AuthRequest } from "../middlewares/auth-middleware";
import { prisma } from "../configs/prisma";

export const getProfile = async (req: AuthRequest, res: Response) => {
   try {
      const firebaseUid = req.user.fbUser.uid;
      
      const user = await prisma.user.findUnique({
         where: { firebaseUid },
      });

      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found",
         });
      }
      
      res.json({
         success: true,
         data: {
            userEmail: user.userEmail,
            firstName: user.firstName,
            lastName: user.lastName,
            provider: user.provider,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
         },
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to fetch profile",
      });
   }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
   try {
      const firebaseUid = req.user.fbUser.uid;
      const { firstName, lastName } = req.body;

      if (!firstName && !lastName) {
         return res.status(400).json({
            success: false,
            message: "Please provide firstName or lastName to update",
         });
      }

      const updatedUser = await prisma.user.update({
         where: { firebaseUid },
         data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            modifiedAt: new Date(),
         },
      });

      res.json({
         success: true,
         message: "Profile updated successfully",
         data: {
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
         },
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to update profile",
      });
   }
};

export const deleteProfile = async (req: AuthRequest, res: Response) => {
   try {
      const firebaseUid = req.user.fbUser.uid;

      const deletedUser = await prisma.user.update({
         where: { firebaseUid },
         data: {
            isActive: false,
            modifiedAt: new Date(),
         },
      });

      res.json({
         success: true,
         message: "Profile deleted successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to delete profile",
      });
   }
};
