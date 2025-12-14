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

    Object.entries(groupStandings).forEach(([group, teams]) => {
        if (teams && teams.length > 0) {
            map[`1${group}`] = {
                name: `Winner ${group}`,
                sourceType: 'GROUP',
                sourceId: group,
                predictedTeamId: teams[0]?.id || null
            };
            map[`2${group}`] = {
                name: `Runner-up ${group}`,
                sourceType: 'GROUP',
                sourceId: group,
                predictedTeamId: teams[1]?.id || null
            };
        }
    });

    if (thirdPlaceTable && thirdPlaceTable.length > 0) {
        thirdPlaceTable.slice(0, 8).forEach((team, idx) => {
            const code = `3rd${idx + 1}`; 
            map[code] = {
                name: `3rd Place #${idx + 1}`,
                sourceType: 'GROUP',
                sourceId: '3RD',
                predictedTeamId: team.id || null
            };
        });
    }

    matches.forEach(m => {
        if (m.stage !== 'GROUP' && m.id) {
            map[`W${m.id}`] = {
                name: `Winner Match ${m.id}`,
                sourceType: 'MATCH',
                sourceId: m.id,
                predictedTeamId: m.winner_id || null 
            };
            map[`L${m.id}`] = {
                name: `Loser Match ${m.id}`,
                sourceType: 'MATCH',
                sourceId: m.id,
                predictedTeamId: null 
            };
        }
    });

    return map;
};