import { Match, Prediction } from "./types";

export const calculateGroupStandings = (matches: Match[], predictions: Record<number, Prediction>) => {
  const standings: Record<string, any> = {};

  matches.forEach(match => {
    const homeId = match.home_team.id;
    const awayId = match.away_team.id;
    const homeName = match.home_team.name;
    const awayName = match.away_team.name;

    if (!standings[homeId]) standings[homeId] = { id: homeId, name: homeName, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, points: 0 };
    if (!standings[awayId]) standings[awayId] = { id: awayId, name: awayName, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, points: 0 };

    // Use prediction if available, otherwise real result
    const pred = predictions[match.id];
    let hScore = match.status === 'FINISHED' ? match.home_score : (pred?.home_score ?? null);
    let aScore = match.status === 'FINISHED' ? match.away_score : (pred?.away_score ?? null);

    if (hScore !== null && aScore !== null) {
      standings[homeId].mp++;
      standings[awayId].mp++;
      standings[homeId].gf += hScore;
      standings[awayId].gf += aScore;
      standings[homeId].ga += aScore;
      standings[awayId].ga += hScore;
      standings[homeId].gd = standings[homeId].gf - standings[homeId].ga;
      standings[awayId].gd = standings[awayId].gf - standings[awayId].ga;

      if (hScore > aScore) {
        standings[homeId].w++; standings[homeId].points += 3;
        standings[awayId].l++;
      } else if (hScore < aScore) {
        standings[awayId].w++; standings[awayId].points += 3;
        standings[homeId].l++;
      } else {
        standings[homeId].d++; standings[homeId].points += 1;
        standings[awayId].d++; standings[awayId].points += 1;
      }
    }
  });

  return Object.values(standings).sort((a: any, b: any) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
};

export const calculateThirdPlaceStandings = (matches: Match[], predictions: Record<number, Prediction>) => {
  // Simplified logic for 3rd place table across all groups
  const standings = calculateGroupStandings(matches, predictions);
  // In a real app, you'd filter for only the teams that finished 3rd in their specific groups
  // For now, returning the top 8 of the aggregated table to prevent crash
  return standings.slice(0, 8);
};