import { GAME_TYPE } from "./constants/game-types";
import { Cocoa_Beaach_Prediction } from "./prediction-list/cocoa-beach";
import { Dark_Smoke_Prediction } from "./prediction-list/dark-smoke";

export const GAME_LOOKUP = {
   [GAME_TYPE.COCOA_BEACH]: (results: any): any => Cocoa_Beaach_Prediction(results),
   [GAME_TYPE.DARK_SMOKE]: (results: any): any => Dark_Smoke_Prediction(results),
}