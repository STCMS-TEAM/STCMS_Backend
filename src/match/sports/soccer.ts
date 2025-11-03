import { Types } from 'mongoose';

export interface SoccerResult {
    score: Record<string, number>; // teamId -> gol
}

export const soccer = {
    name: 'soccer',

    createDefaultResult(teams: string[]): SoccerResult {
        const score: Record<string, number> = {};
        teams.forEach(team => (score[team] = 0));
        return { score };
    },

    validate(result: any) {
        if (!result?.score) throw new Error('Soccer result must include score');
    },
};
