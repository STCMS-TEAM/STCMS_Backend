export const cycling = {
    name: 'cycling',
    defaultResult: {
        ranking: [],
        averageSpeedKmh: 0,
    },
    createDefaultResult(teams: string[]) {
        return this.defaultResult
    },
    validate(result: any) {
        if (!Array.isArray(result.ranking)) throw new Error('Cycling result must include ranking');
    },
};
