export const basketball = {
    name: 'basketball',

    defaultResult: {
        quarters: [],
        finalScore: {},
        playerStats: [],
    },

    createDefaultResult(teams: string[]) {
        return {
            quarters: [
                { [teams[0]]: 0, [teams[1]]: 0 },
                { [teams[0]]: 0, [teams[1]]: 0 },
                { [teams[0]]: 0, [teams[1]]: 0 },
                { [teams[0]]: 0, [teams[1]]: 0 },
            ],
            finalScore: { [teams[0]]: 0, [teams[1]]: 0 },
            playerStats: [],
        };
    },

    validate(result: any) {
        if (!result.finalScore) throw new Error('Basketball result must include finalScore');
    },
};
