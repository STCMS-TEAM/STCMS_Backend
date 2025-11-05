import { Types } from 'mongoose';

export interface BasketballResult {
    score: Record<string, number>;               // punti totali
    partials: { [teamId: string]: number }[];   // punti per quarto
}

export const basketball = {
    name: 'basketball',
    resultType: 'score' as const,

    createDefaultResult(teams: string[]): BasketballResult {
        const score: Record<string, number> = {};
        teams.forEach(team => (score[team] = 0));

        const partials = Array(4).fill(null).map(() => ({
            [teams[0]]: 0,
            [teams[1]]: 0,
        }));

        return { score, partials };
    },

    validate(result: any) {
        if (!result?.score || !Array.isArray(result?.partials))
            throw new Error('Basketball result must include score and partials');
    },
};
