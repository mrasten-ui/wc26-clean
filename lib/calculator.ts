import { Match, Prediction } from "./types";
import { GROUPS } from "./constants"; 

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
        if (!m.home_team_id || !m.away_team_id) return;
        initTeam(m.home_team_id);
        initTeam(m.away_team_id);

        const pred = predictions[m.id];
        // Only count matches that have a full prediction
        if (pred && typeof pred.home_score === 'number' && typeof pred.away_score === 'number') {
            const h = pred.home_score;
            const a = pred.away_score;

            // Update Played
            teams[m.home_team_id].played += 1;
            teams[m.away_team_id].played += 1;

            // Update Goals
            teams[m.home_team_id].gf += h;
            teams[m.home_team_id].ga += a;
            teams[m.away_team_id].gf += a;
            teams[m.away_team_id].ga += h;

            // Update GD
            teams[m.home_team_id].gd += (h - a);
            teams[m.away_team_id].gd += (a - h);

            // Update W/D/L & Points
            if (h > a) {
                teams[m.home_team_id].points += 3;
                teams[m.home_team_id].won += 1;
                teams[m.away_team_id].lost += 1;
            } else if (a > h) {
                teams[m.away_team_id].points += 3;
                teams[m.away_team_id].won += 1;
                teams[m.home_team_id].lost += 1;
            } else {
                teams[m.home_team_id].points += 1;
                teams[m.away_team_id].points += 1;
                teams[m.home_team_id].drawn += 1;
                teams[m.away_team_id].drawn += 1;
            }
        }
    });

    // Sort: Points -> GD -> GF -> Won
    return Object.values(teams).sort((a, b) => 
        b.points - a.points || 
        b.gd - a.gd || 
        b.gf - a.gf || 
        b.won - a.won
    ).map(t => ({
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
    const thirdPlaceTeams: any[] = [];

    GROUPS.forEach(group => {
        // Filter matches for this specific group
        const groupMatches = matches.filter(m => m.stage === 'GROUP' && m.home_team?.group_id === group);
        
        // Calculate standings for this group
        const standings = calculateGroupStandings(groupMatches, predictions);

        // If we have at least 3 teams, the 3rd one (index 2) is the 3rd place team
        if (standings.length >= 3) {
            thirdPlaceTeams.push({
                ...standings[2], // The 3rd place team
                group: group     // Tag it with the group ID (A, B, C...)
            });
        }
    });

    // Sort all 3rd place teams across groups to find the Best 8
    // Sort: Points -> GD -> GF -> Won
    return thirdPlaceTeams.sort((a, b) => 
        b.points - a.points || 
        b.gd - a.gd || 
        b.gf - a.gf || 
        b.won - a.won
    );
};