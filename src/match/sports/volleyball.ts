export const volleyball = {
    name: 'volleyball',

    defaultResult: {
        sets: [],
        setWinner: [],
        playerStats: [],
    },

    createDefaultResult(teams: string[]) {
        return {
            sets: [
                { [teams[0]]: 0, [teams[1]]: 0 },
                { [teams[0]]: 0, [teams[1]]: 0 },
                { [teams[0]]: 0, [teams[1]]: 0 },
            ],
            setWinner: [],
            playerStats: [],
        };
    },

    validate(result: any) {
        if (!Array.isArray(result.sets)) throw new Error('Volleyball result must include sets');
    },
};
