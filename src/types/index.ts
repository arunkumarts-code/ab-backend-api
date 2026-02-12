export type UserType = {
   uId: string;
   firebaseUid: string;
   userEmail: string;
   userAvatar?: string | null;
   userNickName?: string | null;
   firstName?: string | null;
   lastName?: string | null;
   lastLoginAt?: Date | null;
   provider?: string | null;

   defaultMMId: string;
   defaultGameId: string;
   defaultBaseUnit: number;
   defaultStartingBalance: number;
   uCurrentBalance: number;

   gameProfits: GameProfit[];
   dayProfits: DayProfit[];

   createdAt: Date;
   modifiedAt?: Date | null;
   isActive: boolean;
};

export type GameProfit = {
   gameCount: number;
   profitAmount: number;
};

export type DayProfit = {
   date: Date;
   profitAmount: number;
};

export type GameData = {
   Id: number;
   Winner: "B" | "P" | "T" | "-";
   Prediction: string;
   Result: string;
   Bet: number;
   DetectedPattern: string;

   NextHand: NextHandType;

   MMStep: number;
   iCount1: number;
   iCount2: number;

   VirtualWinRequired: boolean;
   VirtualLossRequired: boolean;

   BetUnit: number;
   BaseUnit: number;

   StartingBalance: number;
   CurrentBalance: number;
   ProfitAmount: number;
   Units: number;

   GMId: string;
   MMId: string;

   RecoveryBalance: number;
   IsRecovered: boolean;
};

export type NextHandType = {
   DetectedPattern: string;
   Prediction: string;
   BetAmount: number;
   BetUnit: number;
   MMStep: number;
   Wait: boolean;
   RecoveryList: number[];
   RecoveryBalance: number;
};