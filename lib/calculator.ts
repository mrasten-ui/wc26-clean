import { Match, Prediction } from "./types";

export const calculateScore = (ranking1: number, ranking2: number, isHomeBoosted: boolean, isAwayBoosted: boolean, isHome: boolean) => {
    const rankDiff = ranking2 - ranking1;
    const baseScore = 1.5 + (rankDiff / 50);
    const score = Math.max(0, Math.round(baseScore + (Math.random() * 1.5)));
    
    if (isHome && isHomeBoosted) return score + 1;
    if (!isHome && isAwayBoosted) return score + 1;
    return score;
};

export const calculateGroupStandings = (matches: Match[], predictions: Record<number, Prediction>) => {
    // Initialize stats for every team in the matches
    const teams: Record<string, { 
        id: string, 
        points: number, 
        gd: number, 
        gf: number, 
        ga: number, 
        played: number, 
        won: number, 
        drawn: number, 
        lost: number 
    }> = {};

    // Helper to ensure team exists in object
    const initTeam = (id: string) => {
        if (!teams[id]) teams[id] = { 
            id, points: 0, gd: 0, gf: 0, ga: 0, played: 0, won: 0, drawn: 0, lost: 0 
        };
    };

    matches.forEach(m => {
        const homeId = m.home_team_id!;
        const awayId = m.away_team_id!;
        initTeam(homeId);
        initTeam(awayId);

        const pred = predictions[m.id];
        // Only count matches that have a full prediction
        if (pred && typeof pred.home_score === 'number' && typeof pred.away_score === 'number') {
            const h = pred.home_score;
            const a = pred.away_score;

            // Update Played
            teams[homeId].played += 1;
            teams[awayId].played += 1;

            // Update Goals
            teams[homeId].gf += h;
            teams[homeId].ga += a;
            teams[awayId].gf += a;
            teams[awayId].ga += h;

            // Update GD
            teams[homeId].gd += (h - a);
            teams[awayId].gd += (a - h);

            // Update W/D/L & Points
            if (h > a) {
                teams[homeId].points += 3;
                teams[homeId].won += 1;
                teams[awayId].lost += 1;
            } else if (a > h) {
                teams[awayId].points += 3;
                teams[awayId].won += 1;
                teams[homeId].lost += 1;
            } else {
                teams[homeId].points += 1;
                teams[awayId].points += 1;
                teams[homeId].drawn += 1;
                teams[awayId].drawn += 1;
            }
        }
    });

    // Sort: Points -> GD -> GF
    return Object.values(teams).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf).map(t => ({
        teamId: t.id,
        points: t.points,
        gd: t.gd,
        gf: t.gf,
        ga: t.ga,
        played: t.played,
        won: t.won,
        drawn: t.drawn,
        lost: t.lost
    }));
};

export const calculateThirdPlaceStandings = (matches: Match[], predictions: Record<number, Prediction>) => {
    return []; 
};