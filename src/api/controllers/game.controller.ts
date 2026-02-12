import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth-middleware";
import { prisma } from "../../configs/prisma";
import { GameData, GameProfit } from "../../types";
import { GAME_TYPE } from "../../andiamobac/games/constants/game-types";
import { GAME_LISTES } from "../../andiamobac/games/constants/game-lists";
import { NextPredictionAndBet } from "../../andiamobac/common/prediction-and-bet";

export const getGameResults = async (req: AuthRequest, res: Response) => {
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

      const gameResults = await prisma.userGame.findUnique({
         where: { uId: user.uId },
      });

      if(!gameResults) {
         const lastGameBalance = user.uCurrentBalance < user.defaultStartingBalance
            ? user.defaultStartingBalance
            : user.uCurrentBalance || 0;

         const newGameResults = await prisma.userGame.create({
            data: {
               uId: user.uId,
               gmId: user.defaultGameId,
               mmId: user.defaultMMId,
               ugBaseUnit: user.defaultBaseUnit,
               ugStartingBalance: lastGameBalance,
            },
         });
         res.json({
            success: true,
            data: {
               gmId: newGameResults.gmId,
               mmId: newGameResults.mmId,
               ugBaseUnit: newGameResults.ugBaseUnit,
               ugStartingBalance: newGameResults.ugStartingBalance,
               ugResultList: newGameResults.ugResultList
            },
         });
      }
      else {
         res.json({
            success: true,
            data: {
               gmId: gameResults.gmId,
               mmId: gameResults.mmId,
               ugBaseUnit: gameResults.ugBaseUnit,
               ugStartingBalance: gameResults.ugStartingBalance,
               ugResultList: gameResults.ugResultList
            },
         });
      }
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to fetch game results",
      });
   }
};

export const addHand = async (req: AuthRequest, res: Response) => {
   try {
      const firebaseUid = req.user.fbUser.uid;
      const { hand } = req.body;

      if (!hand || !["P", "B", "T"].includes(hand)) {
         return res.status(400).json({
            success: false,
            message: "Invalid hand. Must be 'P', 'B', or 'T'.",
         });
      }

      const user = await prisma.user.findUnique({
         where: { firebaseUid },
      });

      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found",
         });
      }

      let gameResults = await prisma.userGame.findUnique({
         where: { uId: user.uId },
      });
      
      let lastBalance = Math.max(
         user.defaultStartingBalance ?? 0,
         user.uCurrentBalance ?? 0
      );

      if (!gameResults) {

         gameResults = await prisma.userGame.create({
            data: {
               uId: user.uId,
               gmId: user.defaultGameId,
               mmId: user.defaultMMId,
               ugBaseUnit: user.defaultBaseUnit,
               ugStartingBalance: lastBalance,
               ugResultList: [],
            },
         });
      }
      
      const userGameResult = gameResults.ugResultList as GameData[] || [];
      const lastGameResult = userGameResult.at(-1);
      const gameData = GAME_LISTES[gameResults.gmId];

      let rt: GameData = {
         Id: (gameResults.ugResultList as GameData[]).length + 1,
         Winner: hand,
         Prediction: lastGameResult ? lastGameResult.NextHand.Prediction : "WAIT",
         Result: "-",
         Bet: lastGameResult?.NextHand.BetAmount ?? 0,
         DetectedPattern: lastGameResult?.NextHand.DetectedPattern ?? "-",
         NextHand: {
            DetectedPattern: "-",
            Prediction: "WAIT",
            BetAmount: 0,
            BetUnit: 0,
            MMStep: 0,
            Wait: false,
            RecoveryList: [],
            RecoveryBalance: 0,
         },
         MMStep: lastGameResult?.NextHand.MMStep ?? 0,
         iCount1: lastGameResult?.iCount1 || 0,
         iCount2: lastGameResult?.iCount2 || 0,
         VirtualWinRequired: lastGameResult?.VirtualWinRequired || false,
         VirtualLossRequired: lastGameResult?.VirtualLossRequired || false,
         BetUnit: lastGameResult?.NextHand.BetUnit || gameResults.ugBaseUnit,
         BaseUnit: gameResults.ugBaseUnit,
         StartingBalance: gameResults.ugStartingBalance,
         CurrentBalance: lastGameResult?.CurrentBalance || gameResults.ugStartingBalance,
         ProfitAmount: lastGameResult?.ProfitAmount || 0,
         Units: lastGameResult?.Units || 0,
         GMId: gameResults.gmId,
         MMId: gameResults.mmId,
         RecoveryBalance: lastGameResult?.NextHand.RecoveryBalance ?? 0,
         IsRecovered: true,
      };

      if (
            rt.Prediction !== "WAIT" &&
            rt.Prediction !== "C1" &&
            rt.Prediction !== "C2" &&
            rt.Winner !== "T"
         )
      {
         rt.Result = rt.Winner === rt.Prediction ? "Win" : "Loss";
      }
      if (lastGameResult?.NextHand.Wait){
         rt.Result = "-";
      }
      
      let newRecoverResult = userGameResult;
   
      if (rt.Result === "Win") {
         if(rt.Bet !== 0 ){
            if (gameResults.gmId === GAME_TYPE.COCOA_BEACH ) {
                  lastGameResult?.NextHand?.RecoveryList.forEach((r:any)=>{
                     newRecoverResult[r - 1] = {
                        ...newRecoverResult[r - 1],
                        IsRecovered: true,
                     };
                  })
               }
         }
         rt.Units += Math.ceil(Math.ceil(rt.Bet) / gameResults.ugBaseUnit);
         if (rt.Winner === "B") rt.Bet *= 0.95;
         rt.CurrentBalance = Number(
            (rt.CurrentBalance + rt.Bet).toFixed(2)
         );
         rt.ProfitAmount = Number(
            (rt.ProfitAmount + rt.Bet).toFixed(2)
         );
      } else if (rt.Result === "Loss") {
         rt.Units -= Math.ceil(Math.ceil(rt.Bet) / gameResults.ugBaseUnit);
         rt.IsRecovered = false;
         rt.CurrentBalance = Number(
            (rt.CurrentBalance + (-rt.Bet)).toFixed(2)
         );
         rt.ProfitAmount = Number(
            (rt.ProfitAmount + (-rt.Bet)).toFixed(2)
         );
      } else {
         rt.Bet = 0;
         rt.BetUnit = 0;
         rt.CurrentBalance = Number(
            (rt.CurrentBalance + rt.Bet).toFixed(2)
         );
         rt.ProfitAmount = Number(
            (rt.ProfitAmount + rt.Bet).toFixed(2)
         );
      }
   
      let newGameResult = [...newRecoverResult, rt] 
      const gameUserData = { mmId: gameResults.mmId, gmId: gameResults.gmId, baseUnit: gameResults.ugBaseUnit };

      if (newGameResult.length > gameData.gmStartAt - 1) {
         const tmpNextHand = NextPredictionAndBet(newGameResult, gameUserData);
         rt.iCount1 = tmpNextHand.iCount1;
         rt.iCount2 = tmpNextHand.iCount2;
         rt.VirtualLossRequired = tmpNextHand.VirtualLossRequired;
         rt.VirtualWinRequired = tmpNextHand.VirtualWinRequired;
         rt.NextHand.BetAmount = tmpNextHand.BetAmount
         rt.NextHand.BetUnit = tmpNextHand.BetUnit
         rt.NextHand.Prediction = tmpNextHand.Prediction
         rt.NextHand.DetectedPattern = tmpNextHand.DetectedPattern
         rt.NextHand.MMStep = tmpNextHand.MMStep
         rt.NextHand.RecoveryList = tmpNextHand.RecoveryList
         rt.NextHand.RecoveryBalance = tmpNextHand.RecoveryBalance
   
         if (tmpNextHand.VirtualLossRequired || tmpNextHand.VirtualWinRequired) {
            rt.NextHand.Wait = true;
            rt.NextHand.BetAmount = 0
            rt.NextHand.BetUnit = 0
         }
      }
      newGameResult = [...newRecoverResult, rt] 

      const updatedList = newGameResult as GameData[];

      gameResults =await prisma.userGame.update({
         where: { uId: user.uId },
         data: {
            ugResultList: updatedList,
         },
      });

      return res.json({
         success: true,
         data: {
            gmId: gameResults.gmId,
            mmId: gameResults.mmId,
            ugBaseUnit: gameResults.ugBaseUnit,
            ugStartingBalance: gameResults.ugStartingBalance,
            ugResultList: gameResults.ugResultList,
         },
      });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Failed to add hand",
      });
   }
};

export const newGame = async (req: AuthRequest, res: Response) => {
   try {
      const firebaseUid = req.user.fbUser.uid;
      const {GameID, MMID, BaseUnit} = req.body;

      const user = await prisma.user.findUnique({
         where: { firebaseUid },
      });

      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found",
         });
      }

      let gameResults = await prisma.userGame.findUnique({
         where: { uId: user.uId },
      });

      if (!gameResults) {
         return res.status(400).json({
            success: false,
            message: "No existing game to close",
         });
      }

      const userGameResult = gameResults?.ugResultList as GameData[] || [];
      const lastGame = userGameResult.at(-1);

      const lastBalance =
         (lastGame?.CurrentBalance ?? 0) === 0
            ? Math.max(
               user.uCurrentBalance ?? 0,
               user.defaultStartingBalance ?? 0
            )
            : Math.max(
               lastGame?.CurrentBalance ?? 0,
               user.defaultStartingBalance ?? 0
            );

      const [, updatedGameResults] =await prisma.$transaction([
         prisma.user.update({
            where: { firebaseUid },
            data: {
               uCurrentBalance: lastBalance,
            },
         }),

         prisma.userGame.update({
            where: { uId: user.uId },
            data: {
               ...(GameID && { gmId: GameID }),
               ...(MMID && { mmId: MMID }),
               ...(BaseUnit && { ugBaseUnit: BaseUnit }),
               ugResultList: [],
               ugStartingBalance: lastBalance,
            },
         }),
      ]);

      return res.json({
         success: true,
         data: {
            gmId: updatedGameResults.gmId,
            mmId: updatedGameResults.mmId,
            ugBaseUnit: updatedGameResults.ugBaseUnit,
            ugStartingBalance: updatedGameResults.ugStartingBalance,
            ugResultList: updatedGameResults.ugResultList,
         },
      });

   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Failed to start new game",
      });
   }
}

export const undoHand = async (req: AuthRequest, res: Response) => {
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

      let gameResults = await prisma.userGame.findUnique({
         where: { uId: user.uId },
      });

      if (!gameResults) {
         return res.status(400).json({
            success: false,
            message: "No existing game",
         });
      }

      const resultList = (gameResults.ugResultList as GameData[]) ?? [];
      const gameUserData = { mmId: gameResults.mmId, gmId: gameResults.gmId, baseUnit: gameResults.ugBaseUnit };

      if (resultList.length === 0) {
         return res.status(400).json({
            success: false,
            message: "No game data to undo",
         });
      }

      const lastHand = resultList.at(-1);
      const recoveryList =
         lastHand?.NextHand?.RecoveryList ?? [];

      let updatedList = [...resultList];

      if (recoveryList.length > 0) {
         recoveryList.forEach((index: number) => {
            if (updatedList[index - 1]) {
               updatedList[index - 1] = {
                  ...updatedList[index - 1],
                  IsRecovered: false,
               };
            }
         });
      }

      updatedList = updatedList.slice(0, -1);

      if (updatedList.length > 0) {

         const tmpNextHand = NextPredictionAndBet(
            updatedList,
            gameUserData
         );

         const nextHand: any = {
            BetAmount: tmpNextHand.BetAmount,
            BetUnit: tmpNextHand.BetUnit,
            Prediction: tmpNextHand.Prediction,
            DetectedPattern: tmpNextHand.DetectedPattern,
            MMStep: tmpNextHand.MMStep,
            RecoveryList: tmpNextHand.RecoveryList,
         };
         if (tmpNextHand.VirtualLossRequired || tmpNextHand.VirtualWinRequired) {
            nextHand.Wait = true;
            nextHand.BetAmount = 0;
            nextHand.BetUnit = 0;
         }

         const lastIndex = updatedList.length - 1;

         updatedList[lastIndex] = {
            ...updatedList[lastIndex],
            iCount1: tmpNextHand.iCount1,
            iCount2: tmpNextHand.iCount2,
            VirtualLossRequired: tmpNextHand.VirtualLossRequired,
            VirtualWinRequired: tmpNextHand.VirtualWinRequired,
            NextHand: {
               ...updatedList[lastIndex].NextHand,
               ...nextHand
            },
         };
      }

      gameResults = await prisma.userGame.update({
         where: { uId: user.uId },
         data: {
            ugResultList: updatedList,
         },
      });

      return res.json({
         success: true,
         data: {
            gmId: gameResults.gmId,
            mmId: gameResults.mmId,
            ugBaseUnit: gameResults.ugBaseUnit,
            ugStartingBalance: gameResults.ugStartingBalance,
            ugResultList: gameResults.ugResultList,
         },
      });
   } catch (error) {
      console.error("UNDO ERROR:", error);
      return res.status(500).json({
         success: false,
         message: "Failed to undo hand",
      });
   }
};

export const skipHand = async (req: AuthRequest, res: Response) => {
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

      let gameResults = await prisma.userGame.findUnique({
         where: { uId: user.uId },
      });

      if (!gameResults) {
         return res.status(400).json({
            success: false,
            message: "No existing game",
         });
      }

      const resultList =
         (gameResults.ugResultList as GameData[]) ?? [];

      if (resultList.length === 0) {
         return res.status(400).json({
            success: false,
            message: "No hand to skip",
         });
      }

      let updatedList = [...resultList];
      const lastIndex = updatedList.length - 1;

      updatedList[lastIndex] = {
         ...updatedList[lastIndex],
         NextHand: {
            ...updatedList[lastIndex].NextHand,
            BetAmount: 0,
            RecoveryList: [],
            // MMStep: updatedList[lastIndex - 1]?.MMStep || 0,
            // RecoveryBalance: updatedList[lastIndex - 1]?.RecoveryBalance || 0,
            MMStep: updatedList[lastIndex]?.MMStep || 0,
            RecoveryBalance: updatedList[lastIndex]?.RecoveryBalance || 0,
         },
      };

      gameResults =await prisma.userGame.update({
         where: { uId: user.uId },
         data: {
            ugResultList: updatedList,
         },
      });

      return res.json({
         success: true,
         data: {
            gmId: gameResults.gmId,
            mmId: gameResults.mmId,
            ugBaseUnit: gameResults.ugBaseUnit,
            ugStartingBalance: gameResults.ugStartingBalance,
            ugResultList: gameResults.ugResultList,
         },
      });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Failed to skip hand",
      });
   }
};