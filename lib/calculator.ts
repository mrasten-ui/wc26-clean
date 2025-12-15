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
    const teams: Record<string, { id: string, points: number, gd: number, gf: number }> = {};

    matches.forEach(m => {
        const homeId = m.home_team_id!;
        const awayId = m.away_team_id!;
        if (!teams[homeId]) teams[homeId] = { id: homeId, points: 0, gd: 0, gf: 0 };
        if (!teams[awayId]) teams[awayId] = { id: awayId, points: 0, gd: 0, gf: 0 };

        const pred = predictions[m.id];
        if (pred && pred.home_score !== null && pred.away_score !== null) {
            const h = pred.home_score;
            const a = pred.away_score;

            teams[homeId].gf += h;
            teams[awayId].gf += a;
            teams[homeId].gd += (h - a);
            teams[awayId].gd += (a - h);

            if (h > a) teams[homeId].points += 3;
            else if (a > h) teams[awayId].points += 3;
            else {
                teams[homeId].points += 1;
                teams[awayId].points += 1;
            }
        }
    });

    return Object.values(teams).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf).map(t => ({
        teamId: t.id, // ✅ This is the key the bracket mapper looks for
        points: t.points,
        gd: t.gd
    }));
};

export const calculateThirdPlaceStandings = (matches: Match[], predictions: Record<number, Prediction>) => {
    // Placeholder - returns top 4 third place teams
    return []; 
};