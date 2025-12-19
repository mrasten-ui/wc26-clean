import { Match, Prediction, BracketMap, Standing } from "./types";

/**
 * Calculates the dynamic bracket tree based on FIFA World Cup 2026 Structure
 */
export const calculateBracketMapping = (
    groupStandings: Record<string, Standing[]>, 
    thirdPlaceTable: (Standing & { group: string })[], 
    matches: Match[], 
    predictions: Record<number, Prediction>
): BracketMap => {
    
    // 1. Map Group Results (e.g., "1A", "2B") to actual Team IDs
    const teamSlots: Record<string, string> = {};
    
    Object.keys(groupStandings).forEach(group => {
        const standings = groupStandings[group] || [];
        if (standings.length > 0) teamSlots[`1${group}`] = standings[0].teamId;
        if (standings.length > 1) teamSlots[`2${group}`] = standings[1].teamId;
    });

    // Map Top 8 Third-Place Teams
    const qualifiedThirdPlaces = thirdPlaceTable.slice(0, 8);
    qualifiedThirdPlaces.forEach((t) => {
        teamSlots[`3${t.group}`] = t.teamId;
    });

    const getBestThirdPlace = (preferredGroups: string[]) => {
        for (const group of preferredGroups) {
            if (teamSlots[`3${group}`]) return teamSlots[`3${group}`];
        }
        if (qualifiedThirdPlaces.length > 0) return qualifiedThirdPlaces[0].teamId;
        return null;
    };

    const r32Pairings: Record<number, { home: string, away: string }> = {
        73: { home: "2A", away: "2B" }, 74: { home: "1E", away: "3ABCDF" },
        75: { home: "1F", away: "2C" }, 76: { home: "1C", away: "2F" },
        77: { home: "1I", away: "3CDFGH" }, 78: { home: "2E", away: "2I" },
        79: { home: "1A", away: "3CEFHI" }, 80: { home: "1L", away: "3EHIJK" },
        81: { home: "1D", away: "3BEFIJ" }, 82: { home: "1G", away: "3AEHIJ" },
        83: { home: "2K", away: "2L" }, 84: { home: "1H", away: "2J" },
        85: { home: "1B", away: "3EFGIJ" }, 86: { home: "1J", away: "2H" },
        87: { home: "1K", away: "3DEIJL" }, 88: { home: "2D", away: "2G" }
    };

    const thirdPlacePriorities: Record<number, string[]> = {
        74: ["A", "B", "C", "D", "F"], 77: ["C", "D", "F", "G", "H"],
        79: ["C", "E", "F", "H", "I"], 80: ["E", "H", "I", "J", "K"],
        81: ["B", "E", "F", "I", "J"], 82: ["A", "E", "H", "I", "J"],
        85: ["E", "F", "G", "I", "J"], 87: ["D", "E", "I", "J", "L"]
    };

    const uiMap: BracketMap = {};

    // ✅ SORT matches by ID to ensure R32 (73-88) process before R16 (89-96)
    const sortedMatches = [...matches].sort((a, b) => a.id - b.id);

    sortedMatches.forEach(m => {
        if (m.stage === 'GROUP') return;

        let homeId: string | null = null;
        let awayId: string | null = null;

        // Resolve R32 Pairings
        if (m.stage === 'R32' && r32Pairings[m.id]) {
            const config = r32Pairings[m.id];
            homeId = config.home.startsWith('3') ? getBestThirdPlace(thirdPlacePriorities[m.id] || []) : (teamSlots[config.home] || null);
            awayId = config.away.startsWith('3') ? getBestThirdPlace(thirdPlacePriorities[m.id] || []) : (teamSlots[config.away] || null);
        }

        // Fallback to DB codes
        if (!homeId && m.home_team_id) homeId = m.home_team_id;
        if (!awayId && m.away_team_id) awayId = m.away_team_id;

        // Recursive Winner Resolution
        const resolveWinner = (code: string | undefined): string | null => {
            if (!code || !code.startsWith('W')) return null;
            const feederMatchId = parseInt(code.replace('W', ''));
            const pred = predictions[feederMatchId];

            if (pred && pred.winner_id) return pred.winner_id;
            
            // Score-based resolution
            if (pred && typeof pred.home_score === 'number' && typeof pred.away_score === 'number') {
                const feederHome = uiMap[feederMatchId]?.home;
                const feederAway = uiMap[feederMatchId]?.away;
                if (!feederHome || !feederAway) return null;
                if (pred.home_score > pred.away_score) return feederHome;
                if (pred.away_score > pred.home_score) return feederAway;
            }
            return null;
        };

        if (!homeId) homeId = resolveWinner(m.home_code);
        if (!awayId) awayId = resolveWinner(m.away_code);

        uiMap[m.id] = { home: homeId, away: awayId };
    });

    return uiMap;
};