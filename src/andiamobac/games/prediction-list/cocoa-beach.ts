const Patterns: Record<number, string> = {
   0: "BBPBBPBBPBBPPPBPPBPPBBPPBBPPPBBBBPPBBPBPPBBBBPPBBBPBBPBBPBBPPPBPPBBPBBPPPPBPPBPPBBPB",
   1: "BPBBBPPBPBPBPPPBPBPBBBPPPBPPBPPPBPPPBBBPBBBPBBBBPBPBBBPPPBBBPBBBBPPBBBBPPPBPPPPBBPPB",
   2: "PBBPBBPBBPBBPPBBPPBPPBPPBPPBBBBPPPBBBPPBBBBPPBPBPBBPBBPBBBBPPPBBPBBPPBPPBPPBBPPBPPPP",
   3: "PPBBPPBBPPPBPPBBPPBBBPBBBPBBBPBBBPPBPBBBBPPBBBPBBBPPPBPPBPPPBPPPBPBPBBBPBBBPPBPBPBPP",
   4: "PPBPPBPPBBPBPPBPPBBPBBPPBBPBBPBBPBBPBPBPPBBBPPBBBPPPBBBPPBBBPPBPPBPPBBPPBBPBBPBBPBBP",
   5: "PPBBBPBPPBPBPBBBPBPBPPPBPPPBPPBPPPBBBPBBBPPBBBBPBPPBBBPBBBPBBBPBBBPPBBPPPBPPPBBPPBBP",
   6: "BPBBPBBPBBPPPPBBPPBPPBPPPBBPBBPBBPPBBBPPBBBPPBPBBBBPPBBBPPPBBPPBBPBBPBBPPBBPBBPBBPBB",
   7: "BPPBBPPPPBPPPBBBBPPBBBBPBBBPPPBBBPBPBBBBPBBPBBBPBPPPBPPPBPPBPBBPBPBPPPBPBPBPBPBBBPB",
};

const findRepeatedPatterns = (streakArr :any) => {
   const matches = [];
   let currentChain = [];

   for (let i = 0; i < streakArr.length; i += 2) {
      const lCount = streakArr[i];
      const wCount = streakArr[i + 1];

      // Check for L >= 2 and W exists (which is 0 in our array)
      if (lCount >= 2 && wCount === 0) {
         currentChain.push({ losses: lCount, win: 1 });
      } else {
         // If the chain is 2 or more, save it
         if (currentChain.length >= 2) {
            matches.push([...currentChain]);
         }
         currentChain = []; // Reset

         // Handle the case where the sequence was broken by a single W
         // but the next L streak starts at the next index
         if (lCount === 0) i--;
      }
   }

   // Final check for a chain at the end of the array
   if (currentChain.length >= 2) matches.push(currentChain);
   return matches;
};

const Pattern_deductions = (ResultList: any[] = []) => {
   const streaks = ResultList.map((hand) =>
      ["P", "B"].includes(hand.Prediction)
         ? hand.Prediction === hand.Winner
            ? "W"
            : "L"
         : null,
   )
      .filter((item) => item !== null)
      .reduce<number[]>((acc, curr) => {
         if (curr === "W") {
            acc.push(0);
         } else {
            const last = acc[acc.length - 1];
            if (typeof last === "number" && last > 0) {
               acc[acc.length - 1]++;
            } else {
               acc.push(1);
            }
         }
         return acc;
      }, []);

   const patterns = findRepeatedPatterns(streaks);
   return patterns.length > 0;
};

export const Cocoa_Beaach_Prediction = (results: any[]) => {
   let Prediction = "WAIT";
   let CalculateBet = false;
   let VirtualLossRequired = false;
   let VirtualWinRequired = false;
   let DetectedPattern:any = 0;
   let iCount1 = 0;
   let iCount2 = 0;

   const ResultList = results || [];
   const resultLength = ResultList.length;

   if (resultLength >= 5) {
      const lastHand: any = ResultList.at(-1);
      const lastTwoHands = ResultList.slice(-2)
      .map((hand) => {
         let rt = "-";
         if (["P", "B"].includes(hand.Prediction)) {
            rt = hand.Prediction === hand.Winner ? "W" : "L";
         }
         return rt;
      })
         .join("");
   
      const lastTenHands = ResultList.slice(-9)
         .map((hand) => {
            let rt = "-";
            if (["P", "B"].includes(hand.Prediction)) {
               rt = hand.Prediction === hand.Winner ? "W" : "L";
            }
            return rt;
         })
         .join("");
   
      if (lastHand?.Winner === "T") {
         return {
            Prediction: lastHand?.Prediction || "WAIT",
            CalculateBet: lastHand?.Prediction !== "WAIT",
            VirtualWinRequired: lastHand?.VirtualWinRequired || false,
            VirtualLossRequired: lastHand?.VirtualLossRequired || false,
            DetectedPattern: lastHand?.DetectedPattern || 0,
            iCount1: lastHand?.iCount1 || 0,
            iCount2: lastHand?.iCount2 || 0,
         };
      }
   
      VirtualLossRequired = lastHand?.VirtualLossRequired || false;
      VirtualWinRequired = lastHand?.VirtualWinRequired || false;
      if (resultLength === 5) {
         DetectedPattern = ResultList[0]?.DetectedPattern ?? 0;
      } else DetectedPattern = lastHand?.DetectedPattern || 0;
      if (DetectedPattern === "-") DetectedPattern = 0;
      iCount1 = lastHand?.iCount1 ?? 0;
      iCount2 = lastHand?.iCount2 ?? 0;
   
      if (iCount1 > 0 && iCount1 < 6) {
         iCount1++;
      } else iCount1 = 0;
      if (iCount1 > 0) {
         return {
            Prediction,
            CalculateBet,
            DetectedPattern,
            VirtualWinRequired,
            VirtualLossRequired,
            iCount1,
            iCount2,
         };
      }
   
      if (["P", "B"].includes(lastHand?.Prediction)) {
         if (lastHand?.Prediction !== lastHand?.Winner) {
           if (VirtualLossRequired) VirtualLossRequired = false;
         }
         if (lastHand?.Prediction === lastHand?.Winner) {
           iCount1 = 0;
           if (VirtualWinRequired) {
             VirtualWinRequired = false;
             const detectedPatterns = Pattern_deductions(ResultList);
             if (detectedPatterns) {
               VirtualWinRequired = !(lastTwoHands === "WW");
             }
           }
         }
      }
      if (lastTwoHands === "LL") {
         VirtualWinRequired = true;
      }
      if (lastTenHands === "WWWWWWWWW") {
         iCount1 = 1;
      }
   
      const pLength = Patterns[DetectedPattern]?.length;
      let startIndex = resultLength - (5);
      if (pLength <= resultLength) {
         startIndex = resultLength % pLength;
      }
   
      if (startIndex <= 0 && resultLength !== 5) {
         startIndex = 0;
         DetectedPattern++;
      }
      if (DetectedPattern > 7) {
         DetectedPattern = 0;
      }
   
      Prediction = Patterns[DetectedPattern]
         ? Patterns[DetectedPattern][startIndex]
         : "WAIT";
   }

   CalculateBet =
      Prediction !== "WAIT" && !VirtualLossRequired && !VirtualWinRequired;
      
   return {
      Prediction,
      CalculateBet,
      VirtualWinRequired,
      VirtualLossRequired,
      DetectedPattern,
      iCount1,
      iCount2,
   };
}