import { Types } from 'mongoose';

export interface CyclingResultEntry {
    userId: string;     // atleta
    time: number;       // tempo in secondi
}

export interface CyclingResult {
    ranking: CyclingResultEntry[];
}

export const cycling = {
    name: 'cycling',
    resultType: 'ranking' as const,

    createDefaultResult(teams: string[]): CyclingResult {
        return { ranking: [] }; // si popolerà in base ai giocatori del team
    },

    validate(result: any) {
        if (!Array.isArray(result?.ranking))
            throw new Error('Cycling result must include ranking');
    },
};
