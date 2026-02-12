import { Response } from "express";
import { prisma } from "../../configs/prisma";
import { AuthRequest } from "../../middlewares/auth-middleware";
import { formatTimeAgo, getDateRanges } from "../../utils/dateFilter";

export const getProfitGraph = async (req: AuthRequest, res: Response) => {
   try {
      const firebaseUid = req.user?.fbUser?.uid;

      if (!firebaseUid) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized",
         });
      }

      const user = await prisma.user.findUnique({
         where: { firebaseUid },
         select: { uId: true },
      });

      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found",
         });
      }

      const rawType = req.params.type;

      const type =
         typeof rawType === "string"
            ? rawType.toLowerCase()
            : "day";

      const { currentStart, previousStart, previousEnd } = getDateRanges(type);

      const currentResults = await prisma.gameResult.findMany({
         where: {
            uId: user.uId,
            createdAt: { gte: currentStart },
         },
         orderBy: { createdAt: "asc" },
         select: { profit: true },
      });

      const currentTotal = await prisma.gameResult.aggregate({
         where: {
            uId: user.uId,
            createdAt: { gte: currentStart },
         },
         _sum: { profit: true },
      });

      const previousTotal = await prisma.gameResult.aggregate({
         where: {
            uId: user.uId,
            createdAt: {
               gte: previousStart,
               lt: previousEnd,
            },
         },
         _sum: { profit: true },
      });

      return res.json({
         success: true,
         data: currentResults,
         profitSummary: {
            currentProfit: currentTotal._sum.profit ?? 0,
            previousProfit: previousTotal._sum.profit ?? 0,
         },
      });


   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Failed to fetch profit graph",
      });
   }
};

export const getTop10Players = async (req: AuthRequest, res: Response) => {
   try {
      const rawType = req.params.type;

      const type =
         typeof rawType === "string"
            ? rawType.toLowerCase()
            : "day";

      const { currentStart } = getDateRanges(type);

      const results: any[] = await prisma.$queryRaw`
         SELECT 
         u."uId",
         COALESCE(u."userNickName", u."firstName", 'Player') as "player",
         COUNT(gr."grId") as "totalTrades",
         SUM(gr."profit") as "totalProfit",
         SUM(CASE WHEN gr."isWin" = true THEN 1 ELSE 0 END) as "totalWins"
         FROM "GameResult" gr
         JOIN "User" u ON u."uId" = gr."uId"
         WHERE gr."createdAt" >= ${currentStart}
         GROUP BY u."uId", u."userNickName", u."firstName"
          HAVING SUM(gr."profit") > 0
         ORDER BY SUM(gr."profit") DESC
         LIMIT 10
      `;

      const formatted = results.map((item: any, index: number) => {
         const totalTrades = Number(item.totalTrades);
         const totalWins = Number(item.totalWins);
         const totalProfit = Number(item.totalProfit);

         const winRate =
            totalTrades > 0
               ? ((totalWins / totalTrades) * 100).toFixed(0)
               : "0";

         return {
            rank: index + 1,
            player: item.player,
            winRate: `${winRate}%`,
            totalTrades,
            profit: totalProfit,
         };
      });

      return res.json({
         success: true,
         data: formatted,
      });

   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Failed to fetch top 10 players",
      });
   }
};

export const getLiveWins = async (
   req: AuthRequest,
   res: Response
) => {
   try {
      const results: any[] = await prisma.$queryRaw`
         SELECT 
         COALESCE(u."userNickName", u."firstName", 'Trader') as "name",
         u."userAvatar" as "avatar",
         gr."profit" as "amount",
         gr."createdAt" as "time"
         FROM "GameResult" gr
         JOIN "User" u ON u."uId" = gr."uId"
         WHERE gr."isWin" = true
         ORDER BY gr."createdAt" DESC
         LIMIT 8
      `;

      const formatted = results.map((item: any) => {
         return {
            name: item.name,
            avatar: item.avatar ?? null,
            time: formatTimeAgo(new Date(item.time)),
            amount: Number(item.amount),
         };
      });

      return res.json({
         success: true,
         data: formatted,
      });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Failed to fetch live wins",
      });
   }
};
