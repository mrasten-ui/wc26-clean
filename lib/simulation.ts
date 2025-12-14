// lib/simulation.ts
import { Match, Prediction } from "./types";

/**
 * Calculates a predicted score based on FIFA rankings and "Boost" factors.
 */
const calculateScore = (
    myRank: number, 
    opponentRank: number, 
    isMyTeamBoosted: boolean, 
    isOpponentBoosted: boolean,
    isHome: boolean
) => {
    // 1. Base Expectancy (Average goals ~1.3)
    let lambda = 1.3;

    // 2. Ranking Influence (Diff of 10 ranks = ~0.25 goal swing)
    // Higher rank (lower number) is better.
    const rankDiff = opponentRank - myRank; 
    lambda += (rankDiff / 40);

    // 3. Modifiers
    if (isHome) lambda += 0.15;
    if (isMyTeamBoosted) lambda += 1.2; 
    if (isOpponentBoosted) lambda -= 0.5; 

    // 4. Floors
    if (lambda < 0.2) lambda = 0.2; 
    
    // 5. Poisson-like Simulation
    const random = Math.random();
    let score = 0;
    if (random > 0.95) score = Math.floor(lambda + 2); // Outlier
    else if (random > 0.6) score = Math.round(lambda + 0.5);
    else score = Math.round(lambda);

    return Math.max(0, score);
};

/**
 * Generates a full set of predictions for the Group Stage.
 */
export const generateGroupPredictions = (
    matches: Match[], 
    userId: string, 
    boostedTeams: string[]
): Prediction[] => {
    const groupMatches = matches.filter(m => m.stage === 'GROUP' && m.home_team && m.away_team);
    const newPredictions: Prediction[] = [];

    groupMatches.forEach(m => {
        const homeId = m.home_team!.id;
        const awayId = m.away_team!.id;
        const homeRank = m.home_team!.fifa_ranking || 50;
        const awayRank = m.away_team!.fifa_ranking || 50;

        const isHomeBoosted = boostedTeams.includes(homeId);
        const isAwayBoosted = boostedTeams.includes(awayId);

        const hScore = calculateScore(homeRank, awayRank, isHomeBoosted, isAwayBoosted, true);
        const aScore = calculateScore(awayRank, homeRank, isAwayBoosted, isHomeBoosted, false);

        newPredictions.push({
            match_id: m.id,
            user_id: userId,
            home_score: hScore,
            away_score: aScore,
            winner_id: null
        });
    });

    return newPredictions;
};