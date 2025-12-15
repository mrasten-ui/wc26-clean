import { Match, Prediction } from "./types";
import { calculateScore } from "./calculator";

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
        
        // ✅ FIXED: Added fallback (|| 50) to prevent "possibly undefined" error
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
            away_score: aScore
        });
    });

    return newPredictions;
};