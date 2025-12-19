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
    
    // A. Map Winners (1A) and Runners-Up (2A)
    Object.keys(groupStandings).forEach(group => {
        const standings = groupStandings[group] || [];
        if (standings.length > 0) teamSlots[`1${group}`] = standings[0].teamId;
        if (standings.length > 1) teamSlots[`2${group}`] = standings[1].teamId;
    });

    // B. Map Top 8 Third-Place Teams (3A, 3B...)
    const qualifiedThirdPlaces = thirdPlaceTable.slice(0, 8);
    qualifiedThirdPlaces.forEach((t) => {
        teamSlots[`3${t.group}`] = t.teamId;
    });

    // C. Helper: Find the first available 3rd place team from a list of preferred groups
    // FIFA logic says: "Winner A plays 3rd from C, E, F, H, or I"
    const getBestThirdPlace = (preferredGroups: string[]) => {
        for (const group of preferredGroups) {
            if (teamSlots[`3${group}`]) return teamSlots[`3${group}`];
        }
        // Fallback: Just take the highest ranked one available if exact match fails
        if (qualifiedThirdPlaces.length > 0) return qualifiedThirdPlaces[0].teamId;
        return null;
    };

    // --- OFFICIAL ROUND OF 32 FIXTURES (Matches 73 - 88) ---
    // Source: FIFA World Cup 2026 Schedule
    const r32Pairings: Record<number, { home: string, away: string }> = {
        73: { home: "2A", away: "2B" },
        74: { home: "1E", away: "3ABCDF" }, // Logic handled below
        75: { home: "1F", away: "2C" },
        76: { home: "1C", away: "2F" },
        77: { home: "1I", away: "3CDFGH" },
        78: { home: "2E", away: "2I" },
        79: { home: "1A", away: "3CEFHI" },
        80: { home: "1L", away: "3EHIJK" },
        81: { home: "1D", away: "3BEFIJ" },
        82: { home: "1G", away: "3AEHIJ" },
        83: { home: "2K", away: "2L" },
        84: { home: "1H", away: "2J" },
        85: { home: "1B", away: "3EFGIJ" },
        86: { home: "1J", away: "2H" },
        87: { home: "1K", away: "3DEIJL" },
        88: { home: "2D", away: "2G" }
    };

    // Define the specific 3rd place priority lists for the complex matches
    const thirdPlacePriorities: Record<number, string[]> = {
        74: ["A", "B", "C", "D", "F"],
        77: ["C", "D", "F", "G", "H"],
        79: ["C", "E", "F", "H", "I"],
        80: ["E", "H", "I", "J", "K"],
        81: ["B", "E", "F", "I", "J"],
        82: ["A", "E", "H", "I", "J"],
        85: ["E", "F", "G", "I", "J"],
        87: ["D", "E", "I", "J", "L"]
    };

    const uiMap: BracketMap = {};

    matches.forEach(m => {
        if (m.stage === 'GROUP') return;

        let homeId: string | null = null;
        let awayId: string | null = null;

        // --- STEP 1: RESOLVE R32 MATCHES ---
        if (m.stage === 'R32' && r32Pairings[m.id]) {
            const config = r32Pairings[m.id];
            
            // Resolve Home
            if (config.home.startsWith('3')) {
                // It's a 3rd place slot (complex)
                homeId = getBestThirdPlace(thirdPlacePriorities[m.id] || []);
            } else {
                // It's a standard Winner/Runner-up (1A, 2B, etc.)
                homeId = teamSlots[config.home] || null;
            }

            // Resolve Away
            if (config.away.startsWith('3')) {
                 awayId = getBestThirdPlace(thirdPlacePriorities[m.id] || []);
            } else {
                 awayId = teamSlots[config.away] || null;
            }
        } 
        
        // --- STEP 2: FALLBACK TO DATABASE CODES (For R16, QF, etc.) ---
        if (!homeId && m.home_team_id) homeId = m.home_team_id;
        if (!awayId && m.away_team_id) awayId = m.away_team_id;

        // --- STEP 3: RECURSIVE WINNER RESOLUTION (R16 onwards) ---
        const resolveWinner = (code: string | undefined): string | null => {
            if (!code || !code.startsWith('W')) return null;
            
            const feederMatchId = parseInt(code.replace('W', ''));
            const pred = predictions[feederMatchId];
            
            // If explicit winner picked
            if (pred && pred.winner_id) return pred.winner_id;
            
            // If implied by score
            if (pred && typeof pred.home_score === 'number' && typeof pred.away_score === 'number') {
                // Look up who played in that match
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

        // Assign to map
        uiMap[m.id] = { home: homeId, away: awayId };
    });

    return uiMap;
};