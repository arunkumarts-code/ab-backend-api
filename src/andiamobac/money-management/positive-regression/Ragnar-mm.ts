
export const Ragnar_MM = (results: any, userProfile: any) => {

   let BetAmount = 0;
   let MMStep = 0;
   const BaseUnit = userProfile?.baseUnit || 1;
   const maxBetAmount = BaseUnit * 5;
   
   const ResultList = results || [];
   const ResultLength = ResultList.length || 0;
   const LastHand = ResultList.at(-1)
   const LastResult = LastHand?.Result || "Loss"; 
   const userRecoryList = [];

   let RecoveryList = ResultList
      .map((r: any) => (!r.IsRecovered ? r : null))
      .filter((r: any) => r !== null)
   
   let betamount = 0;
   if (LastResult === "Win" && LastHand?.Bet > 0) {
      if (RecoveryList.length > 0) {
         for (let i = 0; i < RecoveryList.length; i++){
            betamount += RecoveryList[i].Bet;
            userRecoryList.push(RecoveryList[i].Id);
            if (maxBetAmount <= betamount){
               break;
            }
         }
      }
   }


   if (LastResult === "Loss" || ResultLength <= 1) {
      BetAmount = BaseUnit;
   } else if (LastResult === "Win") {
      if (RecoveryList.length > 0 && LastHand?.Bet > 0) {
         const totalBet = RecoveryList.reduce((sum: number, r: any) => {
            return sum + (r.Bet || 0);
         }, 0);
         if (totalBet > maxBetAmount) BetAmount = maxBetAmount;
         else BetAmount = totalBet || BaseUnit;
      } else BetAmount = BaseUnit;
   }

   return { BetAmount, MMStep, userRecoryList };
};