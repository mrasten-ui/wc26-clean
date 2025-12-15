import { Match, Prediction, BracketMap } from "./types";

export const calculateBracketMapping = (
    groupStandings: Record<string, any[]>,
    thirdPlaceTable: any[],
    matches: Match[],
    predictions: Record<number, Prediction> = {} 
): BracketMap => {
    const map: BracketMap = {};

    Object.keys(groupStandings).forEach(group => {
        const standings = groupStandings[group];
        if (standings && standings.length > 0) {
            map[`1${group}`] = { 
                name: `Winner Group ${group}`, 
                sourceType: 'GROUP', 
                predictedTeamId: standings[0]?.teamId || null 
            };
            map[`2${group}`] = { 
                name: `Runner-up Group ${group}`, 
                sourceType: 'GROUP', 
                predictedTeamId: standings[1]?.teamId || null 
            };
        }
    });

    matches.forEach(m => {
        if (m.stage !== 'GROUP') {
            const winnerKey = `W${m.id}`;
            const loserKey = `L${m.id}`;
            
            // ✅ SAFETY FIX: Ensure predictions object exists before accessing
            const userPrediction = predictions?.[m.id]?.winner_id;
            
            map[winnerKey] = {
                name: `Winner Match ${m.id}`,
                sourceType: 'MATCH',
                sourceId: m.id,
                predictedTeamId: userPrediction || null
            };

            map[loserKey] = {
                name: `Loser Match ${m.id}`,
                sourceType: 'MATCH',
                sourceId: m.id,
                predictedTeamId: null 
            };
        }
    });

    return map;
};