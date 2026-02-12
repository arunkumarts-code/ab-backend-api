export const getDateRanges = (type: string = "day") => {
   const now = new Date();

   let currentStart = new Date();
   let previousStart = new Date();
   let previousEnd = new Date();

   switch (type) {
      case "day": {
         currentStart.setHours(0, 0, 0, 0);

         previousStart = new Date(currentStart);
         previousStart.setDate(previousStart.getDate() - 1);

         previousEnd = new Date(currentStart);
         break;
      }

      case "week": {
         const day = now.getDay();

         currentStart.setDate(now.getDate() - day);
         currentStart.setHours(0, 0, 0, 0);

         previousStart = new Date(currentStart);
         previousStart.setDate(previousStart.getDate() - 7);

         previousEnd = new Date(currentStart);
         break;
      }

      case "month": {
         currentStart = new Date(now.getFullYear(), now.getMonth(), 1);

         previousStart = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
         );

         previousEnd = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
         );

         break;
      }

      case "year": {
         currentStart = new Date(now.getFullYear(), 0, 1);

         previousStart = new Date(now.getFullYear() - 1, 0, 1);

         previousEnd = new Date(now.getFullYear(), 0, 1);

         break;
      }

      default: {
         currentStart.setHours(0, 0, 0, 0);
         previousStart = new Date(currentStart);
         previousStart.setDate(previousStart.getDate() - 1);
         previousEnd = new Date(currentStart);
      }
   }

   return {
      currentStart,
      previousStart,
      previousEnd,
   };
};

export const formatTimeAgo = (date: Date) => {
   const diffSeconds = Math.floor(
      (Date.now() - date.getTime()) / 1000
   );

   if (diffSeconds < 60) return "Just now";

   if (diffSeconds < 3600) {
      const mins = Math.floor(diffSeconds / 60);
      return `${mins} min${mins > 1 ? "s" : ""} ago`;
   }

   if (diffSeconds < 86400) {
      const hours = Math.floor(diffSeconds / 3600);
      return `${hours} hr${hours > 1 ? "s" : ""} ago`;
   }

   const days = Math.floor(diffSeconds / 86400);
   return `${days} day${days > 1 ? "s" : ""} ago`;
};
