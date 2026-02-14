import { AuthRequest } from "../../middlewares/auth-middleware";
import { Response } from "express";
import { prisma } from "../../configs/prisma";

export const getUserGames = async (req: AuthRequest, res: Response) => {
   try {
      const userId = req.user.dbUser.uId;

      if (!userId) {
         return res.status(404).json({
            success: false,
            message: "User not found",
         });
      }

      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Number(req.query.limit) || 10, 50); 
      const skip = (page - 1) * limit;

      const totalRecords = await prisma.userGame.count({
         where: {
            uId: userId,
            isCompleted: true,
         },
      });

      const games = await prisma.userGame.findMany({
         where:{
            uId: userId,
            isCompleted: true,
         },
         orderBy: {
            createdAt: "desc",
         },
         skip,
         take: limit,
         select: {
            ugId: true,
            profit: true,
            isWin: true,
            ugBaseUnit: true,
            ugStartingBalance: true,
            createdAt: true,
         },
      });

      return res.json({
         success: true,
         pagination: {
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page,
            limit,
         },
         data: games,
      });

   } catch (error) {
      console.error("Get user games error:", error);

      return res.status(500).json({
         success: false,
         message: "Failed to fetch user games",
      });
   }
};

export const getUserGamesSummary = async (
   req: AuthRequest,
   res: Response
) => {
   try {
      const userId = req.user.dbUser.uId;

      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "User not found",
         });
      }

      const summary = await prisma.userGame.aggregate({
         where: {
            uId: userId,
            isCompleted: true,
         },
         _count: {
            ugId: true,
         },
         _sum: {
            profit: true,
         },
      });

      const wins = await prisma.userGame.count({
         where: {
            uId: userId,
            isCompleted: true,
            isWin: true,
         },
      });

      const losses = await prisma.userGame.count({
         where: {
            uId: userId,
            isCompleted: true,
            isWin: false,
         },
      });

      const totalGames = summary._count.ugId || 0;
      const totalProfitRaw = summary._sum.profit || 0;

     
      return res.json({
         success: true,
         data: {
            totalGames,
            totalWins: wins,
            totalLosses: losses,
            totalProfit: totalProfitRaw > 0 ? totalProfitRaw : 0,
         },
      });
   } catch (error) {
      console.error("History summary error:", error);

      return res.status(500).json({
         success: false,
         message: "Failed to fetch history summary",
      });
   }
};

export const getGameById = async (req: AuthRequest, res: Response) => {
   try {
      const userId = req.user.dbUser.uId;
      const gameId = req.params.gameId as string;  

      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "User not found",
         });
      }

      if(!gameId){
         return res.status(400).json({
            success: false,
            message: "Game ID is required",
         });
      }

      const game = await prisma.userGame.findFirst({
         where: {
            uId: userId,
            ugId: gameId,
         },
      });

      if (!game) {
         return res.status(404).json({
            success: false,
            message: "Game not found",
         });
      }

      return res.json({
         success: true,
         data: game.ugResultList,
      });
   }
   catch (error) {
      console.error("Get game by ID error:", error);
      return res.status(500).json({
         success: false,
         message: "Failed to fetch game details",
      });
   }
}