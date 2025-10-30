export const soccer = {
    name: 'soccer',

    defaultResult: {
        score: {},       // i team saranno aggiunti dopo la creazione
        events: [],
        playerStats: [],
    },

    createDefaultResult(teams: string[]) {
        const score: Record<string, number> = {};
        teams.forEach(team => score[team] = 0);
        return {
            score,
            events: [],
            playerStats: [],
        };
    },

    validate(result: any) {
        if (!result.score) throw new Error('Soccer result must include score');
    },
};
