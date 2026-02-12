const Generate_Big_Road = (gameResults:any = []) => {
  let BigRoadData = [];
  if (gameResults.length > 0) {
    BigRoadData = gameResults
      .map((p: any) => p.Winner)
      .reduce(
        (rows: any, key: any, index: any) =>
          ((gameResults[index - 1]?.Winner || "") !== key
            ? rows.push([key])
            : rows[rows.length - 1].push(key)) && rows,
        []
      );
  }
  return BigRoadData;
};

const Get_DarkSmoke_DetectedPattern = (resultList: any, GameStartIndex: number) => {
  const ResultList = resultList || [];
  const length = ResultList.length;
  let rt = "-";
  if (length < GameStartIndex) {
    rt = "-";
  } else if (length >= GameStartIndex) {
    const road = Generate_Big_Road(ResultList);
    const length1 = road[road.length - 1]?.length || 0;
    const length2 = road[road.length - 2]?.length || 0;

    if (
      (length1 === 1 && length2 === 1) ||
      (length1 === 2 && (length2 === 1 || length2 === 0)) ||
      (length1 === length2 && length1 === 2) ||
      length1 === 2
    )
      rt = "Chop";
    else if (length1 >= 3 || (length1 === 1 && length2 === 2)) rt = "Streak";
  }
  return rt;
};

export const Dark_Smoke_Prediction = (results: any[]) => {
  let Prediction = "WAIT";
  let CalculateBet = false;
  let VirtualLossRequired = false;
  let VirtualWinRequired = false;
  let DetectedPattern = "-";

  const ResultList = results || [];
  const lastHand = ResultList[ResultList.length - 1];
  const lastWinner = lastHand?.Winner || "";

  DetectedPattern = Get_DarkSmoke_DetectedPattern(
    ResultList,
    2
  );

  if (DetectedPattern !== "-") {
    CalculateBet = true;
    if (DetectedPattern === "Streak") {
      Prediction = lastWinner;
    } else {
      Prediction = lastWinner === "P" ? "B" : "P";
    }
  }

  return {
    Prediction,
    CalculateBet,
    VirtualWinRequired,
    VirtualLossRequired,
    DetectedPattern,
  };
};