import { BracketMap } from "./types";

export const normalizeStage = (stage: string) => {
    if (stage === 'ROUND_OF_32') return 'R32';
    if (stage === 'ROUND_OF_16') return 'R16';
    if (stage === 'QUARTER_FINALS') return 'QF';
    if (stage === 'SEMI_FINALS') return 'SF';
    if (stage === '3RD_PLACE') return '3RD';
    if (stage === 'FINAL') return 'FINAL';
    return stage;
};

// Maps standardized placeholder codes (1A, 2B, etc) to Team IDs based on standings
export const calculateBracketMapping = (
    groupStandings: Record<string, any[]>, 
    thirdPlaceTable: any[], 
    matches: any[]
): BracketMap => {
    const map: BracketMap = {};

    // 1. Map Group Winners (1A..1L) and Runners Up (2A..2L)
    // groupStandings is { "A": [ {id: 'MEX', ...}, {id: 'KSA', ...} ] }
    Object.entries(groupStandings).forEach(([group, teams]) => {
        if (teams && teams.length > 0) {
            // Winner
            map[`1${group}`] = {
                name: `Winner ${group}`,
                sourceType: 'GROUP',
                sourceId: group,
                predictedTeamId: teams[0]?.id || null
            };
            // Runner Up
            map[`2${group}`] = {
                name: `Runner-up ${group}`,
                sourceType: 'GROUP',
                sourceId: group,
                predictedTeamId: teams[1]?.id || null
            };
        }
    });

    // 2. Map 3rd Place Teams (3rd1..3rd8)
    // This logic is complex in real WC26, assuming simplified top 8 for now
    if (thirdPlaceTable && thirdPlaceTable.length > 0) {
        thirdPlaceTable.slice(0, 8).forEach((team, idx) => {
            const code = `3rd${idx + 1}`; // 3rd1, 3rd2...
            map[code] = {
                name: `3rd Place #${idx + 1}`,
                sourceType: 'GROUP',
                sourceId: '3RD',
                predictedTeamId: team.id || null
            };
        });
    }

    // 3. Map Knockout Winners (W1, W2... for Match IDs)
    // Matches should be sorted or accessed by ID
    matches.forEach(m => {
        if (m.stage !== 'GROUP' && m.id) {
            // If the match is finished or predicted, who won?
            // Note: This requires the predictions to be integrated into the match object passed here
            // For now, we set up the placeholder
            map[`W${m.id}`] = {
                name: `Winner Match ${m.id}`,
                sourceType: 'MATCH',
                sourceId: m.id,
                predictedTeamId: m.winner_id || null // This needs to come from prediction data
            };
            map[`L${m.id}`] = {
                name: `Loser Match ${m.id}`,
                sourceType: 'MATCH',
                sourceId: m.id,
                predictedTeamId: null // Typically for 3rd place playoff
            };
        }
    });

    return map;
};