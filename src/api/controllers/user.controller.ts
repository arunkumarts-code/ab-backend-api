import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth-middleware";
import { prisma } from "../../configs/prisma";

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
            userAvatar: user.userAvatar,
            userNickName: user.userNickName,
            provider: user.provider,
            defaultMMId: user.defaultMMId,
            defaultGameId: user.defaultGameId,
            defaultBaseUnit: user.defaultBaseUnit,
            defaultStartingBalance: user.defaultStartingBalance,
            uCurrentBalance: user.uCurrentBalance,
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
      const { firstName, lastName, userNickName } = req.body;

      if (!firstName && !lastName && !userNickName) {
         return res.status(400).json({
            success: false,
            message: "Please provide valid user data (firstName, lastName, userNickName) to update",
         });
      }

      const updatedUser = await prisma.user.update({
         where: { firebaseUid },
         data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(userNickName && { userNickName }),
            modifiedAt: new Date(),
         },
      });

      res.json({
         success: true,
         message: "Profile updated successfully",
         data: {
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            userNickName: updatedUser.userNickName,
         },
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to update profile",
      });
   }
};

export const updateAvatar = async (req: AuthRequest, res: Response) => {
   try {
      const firebaseUid = req.user.fbUser.uid;
      const { userAvatar } = req.body;

      if (!userAvatar) {
         return res.status(400).json({
            success: false,
            message: "Please provide valid userAvatar to update",
         });
      }

      const updatedUser = await prisma.user.update({
         where: { firebaseUid },
         data: {
            ...(userAvatar && { userAvatar }),
            modifiedAt: new Date(),
         },
      });

      res.json({
         success: true,
         message: "Profile avatar updated successfully",
         data: {
            userAvatar: updatedUser.userAvatar,
         },
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to update profile avatar",
      });
   }
}

export const deleteProfile = async (req: AuthRequest, res: Response) => {
   try {
      const firebaseUid = req.user.fbUser.uid;

      await prisma.user.update({
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
