import { Types } from 'mongoose';

export interface VolleyballResult {
    score: Record<string, number>;               // punti totali
    partials: { [teamId: string]: number }[];   // punti per set
}

export const volleyball = {
    name: 'volleyball',

    createDefaultResult(teams: string[]): VolleyballResult {
        return {
            score: { [teams[0]]: 0, [teams[1]]: 0 },
            partials: [
                { [teams[0]]: 0, [teams[1]]: 0 },
                { [teams[0]]: 0, [teams[1]]: 0 },
                { [teams[0]]: 0, [teams[1]]: 0 },
            ],
        };
    },

    validate(result: any) {
        if (!result?.score || !Array.isArray(result?.partials))
            throw new Error('Volleyball result must include score and partials');
    },
};
