export const athletics = {
    name: 'athletics',
    defaultResult: {
        ranking: [],
        unit: 'seconds',
    },
    createDefaultResult(teams: string[]) {
        return this.defaultResult
    },
    validate(result: any) {
        if (!Array.isArray(result.ranking)) throw new Error('Athletics result must include ranking');
    },
};
