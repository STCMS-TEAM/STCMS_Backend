import { Types } from 'mongoose';

export interface AthleticsResultEntry {
    userId: string;
    performance: number; // tempo o distanza
}

export interface AthleticsResult {
    ranking: AthleticsResultEntry[];
}

export const athletics = {
    name: 'athletics',

    createDefaultResult(teams: string[]): AthleticsResult {
        return { ranking: [] };
    },

    validate(result: any) {
        if (!Array.isArray(result?.ranking))
            throw new Error('Athletics result must include ranking');
    },
};
