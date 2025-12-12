export const normalizeStage = (stage: string) => {
    if (stage === 'ROUND_OF_32') return 'R32';
    if (stage === 'ROUND_OF_16') return 'R16';
    if (stage === 'QUARTER_FINALS') return 'QF';
    if (stage === 'SEMI_FINALS') return 'SF';
    if (stage === '3RD_PLACE') return '3RD';
    if (stage === 'FINAL') return 'FINAL';
    return stage;
};

export const calculateBracketMapping = (groupStandings: any, thirdPlace: any, predictions: any, knockoutMatches: any) => {
    const map: Record<string, string> = {};
    // This function would usually contain complex logic to map "Winner A" to "Match 33 Home"
    // For now, we return a simple mapping or the real team IDs if known
    return map; 
};