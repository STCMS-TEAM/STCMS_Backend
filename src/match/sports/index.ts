import {soccer, SoccerResult} from './soccer';
import {basketball, BasketballResult} from './basketball';
import {volleyball, VolleyballResult} from './volleyball';
import {cycling, CyclingResult} from './cycling';
import {athletics, AthleticsResult} from './athletics';

export const SPORTS = {
    soccer,
    basketball,
    volleyball,
    cycling,
    athletics,
};

export type SportType = keyof typeof SPORTS;

export type MatchResultMap = {
    soccer: SoccerResult;
    volleyball: VolleyballResult;
    basketball: BasketballResult;
    cycling: CyclingResult;
    athletics: AthleticsResult;
};

export type MatchResult = MatchResultMap[SportType];
