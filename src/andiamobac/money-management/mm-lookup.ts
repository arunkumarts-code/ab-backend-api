import { MM_TYPES } from "./constants/mm-types";
import { Orc_III_MM } from "./positive-regression/Orc-III-mm";
import { Ragnar_MM } from "./positive-regression/Ragnar-mm";

export const MM_LOOKUP = {
   [MM_TYPES.RAGNAR_MM]: (results: any, user: any): any => Ragnar_MM(results, user),
   [MM_TYPES.ORC_III_MM]: (results: any, user: any): any => Orc_III_MM(results, user),
}