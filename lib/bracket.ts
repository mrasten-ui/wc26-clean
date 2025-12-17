import { Match, Prediction, BracketMap, Standing } from "./types";

/**
 * Calculates the dynamic bracket tree.
 */
export const calculateBracketMapping = (
    groupStandings: Record<string, Standing[]>, 
    thirdPlaceTable: (Standing & { group: string })[], 
    matches: Match[], 
    predictions: Record<number, Prediction>
): BracketMap => {
    
    // 1. Map Group Results (e.g., "1A", "2B") to actual Team IDs
    const groupPlaceholders: Record<string, string> = {};
    
    Object.keys(groupStandings).forEach(group => {
        const standings = groupStandings[group] || [];
        if (standings.length > 0) groupPlaceholders[`1${group}`] = standings[0].teamId;
        if (standings.length > 1) groupPlaceholders[`2${group}`] = standings[1].teamId;
    });

    const uiMap: BracketMap = {};

    matches.forEach(m => {
        if (m.stage === 'GROUP') return;

        let homeId: string | null = m.home_team_id;
        let awayId: string | null = m.away_team_id;

        // 1. Resolve placeholders like "1A" if direct ID is missing
        if (!homeId && m.home_team?.tbd_code) {
             const code = m.home_team.tbd_code;
             if (groupPlaceholders[code]) homeId = groupPlaceholders[code];
        }
        if (!awayId && m.away_team?.tbd_code) {
             const code = m.away_team.tbd_code;
             if (groupPlaceholders[code]) awayId = groupPlaceholders[code];
        }

        // 2. Recursive Winner Resolution (The "W73" logic)
        const resolveWinner = (code: string | undefined): string | null => {
            if (!code || !code.startsWith('W')) return null;
            
            const feederMatchId = parseInt(code.replace('W', ''));
            const pred = predictions[feederMatchId];
            
            // If explicit winner picked
            if (pred && pred.winner_id) return pred.winner_id;
            
            // If implied by score
            if (pred && typeof pred.home_score === 'number' && typeof pred.away_score === 'number') {
                const feederMatch = matches.find(fm => fm.id === feederMatchId);
                if (!feederMatch) return null;

                // Recursive check for who played in that feeder match
                // We check if we already calculated it in uiMap, otherwise fallback to static ID
                const feederHome = uiMap[feederMatchId]?.home || feederMatch.home_team_id;
                const feederAway = uiMap[feederMatchId]?.away || feederMatch.away_team_id;
                
                if (pred.home_score > pred.away_score) return feederHome;
                if (pred.away_score > pred.home_score) return feederAway;
            }
            return null;
        };

        if (!homeId) homeId = resolveWinner(m.home_code);
        if (!awayId) awayId = resolveWinner(m.away_code);

        // Assign to map
        uiMap[m.id] = { home: homeId, away: awayId };
    });

    return uiMap;
};