import { Match, Prediction, BracketMap, Standing } from "./types";

// ✅ EXPORTED STRUCTURE: Defines who plays who from Match 73 to 104
export const BRACKET_STRUCTURE: Record<number, { home: string, away: string }> = {
    // R32
    73: { home: "2A", away: "2B" }, 74: { home: "1E", away: "3ABCDF" },
    75: { home: "1F", away: "2C" }, 76: { home: "1C", away: "2F" },
    77: { home: "1I", away: "3CDFGH" }, 78: { home: "2E", away: "2I" },
    79: { home: "1A", away: "3CEFHI" }, 80: { home: "1L", away: "3EHIJK" },
    81: { home: "1D", away: "3BEFIJ" }, 82: { home: "1G", away: "3AEHIJ" },
    83: { home: "2K", away: "2L" }, 84: { home: "1H", away: "2J" },
    85: { home: "1B", away: "3EFGIJ" }, 86: { home: "1J", away: "2H" },
    87: { home: "1K", away: "3DEIJL" }, 88: { home: "2D", away: "2G" },
    // R16
    89: { home: "W74", away: "W77" }, 90: { home: "W73", away: "W75" },
    91: { home: "W76", away: "W78" }, 92: { home: "W79", away: "W80" },
    93: { home: "W81", away: "W83" }, 94: { home: "W82", away: "W84" },
    95: { home: "W85", away: "W87" }, 96: { home: "W86", away: "W88" },
    // QF
    97: { home: "W89", away: "W90" }, 98: { home: "W91", away: "W92" },
    99: { home: "W93", away: "W94" }, 100: { home: "W95", away: "W96" },
    // SF
    101: { home: "W97", away: "W98" }, 102: { home: "W99", away: "W100" },
    // FINAL
    103: { home: "L101", away: "L102" }, 104: { home: "W101", away: "W102" }
};

export const calculateBracketMapping = (
    groupStandings: Record<string, Standing[]>, 
    thirdPlaceTable: (Standing & { group: string })[], 
    matches: Match[], 
    predictions: Record<number, Prediction>
): BracketMap => {
    
    const teamSlots: Record<string, string> = {};
    
    Object.keys(groupStandings).forEach(group => {
        const standings = groupStandings[group] || [];
        if (standings.length > 0) teamSlots[`1${group}`] = standings[0].teamId;
        if (standings.length > 1) teamSlots[`2${group}`] = standings[1].teamId;
    });

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

    const thirdPlacePriorities: Record<number, string[]> = {
        74: ["A", "B", "C", "D", "F"], 77: ["C", "D", "F", "G", "H"],
        79: ["C", "E", "F", "H", "I"], 80: ["E", "H", "I", "J", "K"],
        81: ["B", "E", "F", "I", "J"], 82: ["A", "E", "H", "I", "J"],
        85: ["E", "F", "G", "I", "J"], 87: ["D", "E", "I", "J", "L"]
    };

    const uiMap: BracketMap = {};
    const sortedMatches = [...matches].sort((a, b) => a.id - b.id);

    sortedMatches.forEach(m => {
        if (m.stage === 'GROUP') return;

        let homeId: string | null = null;
        let awayId: string | null = null;

        const resolveWinner = (code: string | undefined): string | null => {
            if (!code) return null;
            if (code.startsWith('W')) {
                const feederMatchId = parseInt(code.replace('W', ''));
                const pred = predictions[feederMatchId];
                if (pred && pred.winner_id) return pred.winner_id;
                
                // Fallback to Score if Winner ID missing
                if (pred && typeof pred.home_score === 'number' && typeof pred.away_score === 'number') {
                    const feederHome = uiMap[feederMatchId]?.home;
                    const feederAway = uiMap[feederMatchId]?.away;
                    if (!feederHome || !feederAway) return null;
                    if (pred.home_score > pred.away_score) return feederHome;
                    if (pred.away_score > pred.home_score) return feederAway;
                }
                return null;
            }
            if (code.startsWith('L')) {
                const feederMatchId = parseInt(code.replace('L', ''));
                const pred = predictions[feederMatchId];
                if (!pred) return null;
                const feederHome = uiMap[feederMatchId]?.home;
                const feederAway = uiMap[feederMatchId]?.away;
                if (!feederHome || !feederAway) return null;
                if (pred.winner_id === feederHome) return feederAway;
                if (pred.winner_id === feederAway) return feederHome;
                if (typeof pred.home_score === 'number' && typeof pred.away_score === 'number') {
                    if (pred.home_score > pred.away_score) return feederAway;
                    if (pred.away_score > pred.home_score) return feederHome;
                }
                return null;
            }
            if (teamSlots[code]) return teamSlots[code];
            if (code.startsWith('3') && code.length > 2) return getBestThirdPlace(thirdPlacePriorities[m.id] || []);
            return null;
        };

        if (BRACKET_STRUCTURE[m.id]) {
            const config = BRACKET_STRUCTURE[m.id];
            homeId = resolveWinner(config.home);
            awayId = resolveWinner(config.away);
        } else {
            if (!homeId && m.home_team_id) homeId = m.home_team_id;
            if (!awayId && m.away_team_id) awayId = m.away_team_id;
            if (!homeId) homeId = resolveWinner(m.home_code || '');
            if (!awayId) awayId = resolveWinner(m.away_code || '');
        }

        uiMap[m.id] = { home: homeId, away: awayId };
    });

    return uiMap;
};