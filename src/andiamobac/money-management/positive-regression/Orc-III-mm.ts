import { MM_LISTES } from "../constants/mm-lists";

export const Orc_III_MM = (results: any, userProfile: any) => {

   const mmData = MM_LISTES[userProfile?.mmId];

   const BaseUnit = userProfile?.baseUnit || 1;
   const BaseIndex = 1 ;
   let CurrentStreak = BaseIndex;
   let betAmount = 0;
   let RecoveryBalance = 0;
   const ResultList = results || [];
   const resultLength = ResultList.length || 0;
   const tmpResult = ResultList.filter(
      (p: any) => ["Win", "Loss"].includes(p?.Result)
   );

   if (resultLength > 0) {
      const lastHand = ResultList[resultLength - 1];
      if ((lastHand?.MMId || "") === (userProfile?.mmId || "")) {
         CurrentStreak = lastHand?.MMStep ?? 0;
         RecoveryBalance = lastHand?.RecoveryBalance ?? 0;
         let BetUnit = lastHand?.BetUnit ?? 0;
         let lastResult = lastHand?.Result || "";

         if (lastResult === "Win") RecoveryBalance = RecoveryBalance + BetUnit;
         else if (lastResult === "Loss")
            RecoveryBalance = RecoveryBalance - BetUnit;

         if (!["Win", "Loss"].includes(lastResult)) {
            lastResult = tmpResult[tmpResult.length - 1]?.Result || "";
            CurrentStreak =
               tmpResult[tmpResult.length - 1]?.ugNextHand?.CurrentStreak || 0;
         }

         let checkRecovery = true;

         if (lastResult === "Win") {
            if (CurrentStreak === BaseIndex) {
               CurrentStreak = CurrentStreak - 1;
               checkRecovery = false;
            } else if (CurrentStreak === 0 || RecoveryBalance >= 0) {
               CurrentStreak = BaseIndex;
               checkRecovery = false;
               if (RecoveryBalance > 0) RecoveryBalance = 0;
            }
         } else if (lastResult === "Loss") {
            if (CurrentStreak === BaseIndex) {
               CurrentStreak = CurrentStreak + 1;
               checkRecovery = false;
            } else if (CurrentStreak === 0) {
               checkRecovery = false;
               CurrentStreak = 3;
            }
         }

         if (checkRecovery) {
            if (RecoveryBalance < 0) {
               const index = (mmData?.mmStepsList || []).findIndex(
                  (subArr) => subArr[0] === RecoveryBalance * -1 * BaseUnit
               );
               if (index < 0 || CurrentStreak < index) CurrentStreak++;
               else if (CurrentStreak > index) CurrentStreak = index + 1;
            } else if (RecoveryBalance >= 0) {
               CurrentStreak = BaseIndex;
               RecoveryBalance = 0;
            }
         }
      }
   }
   if (CurrentStreak >= (mmData?.mmStepsList || []).length)
      CurrentStreak = BaseIndex;

   const tmp: any = mmData?.mmStepsList[CurrentStreak];
   
   betAmount = (tmp[0] || 0) * 1 * (tmp[1] || 0);

   return {
      MMStep: CurrentStreak,
      BetAmount: betAmount * BaseUnit,
      RecoveryBalance,
   };
};