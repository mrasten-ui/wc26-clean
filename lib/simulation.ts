// Define the Team interface to include 'id'
interface Team {
  id: string; // This was missing and caused the build failure
  name: string;
  group_id: string;
  tbd_code?: string;
  ranking?: number; // Optional, based on your log comment about rankings
}

interface Match {
  home_team: Team | null;
  away_team: Team | null;
  // ... other match properties like home_score, away_score, etc.
}

export function simulateGroupMatches(groupMatches: Match[]) {
  groupMatches.forEach(m => {
    // These lines now have the 'id' property recognized by TypeScript
    const homeId = m.home_team!.id;
    const awayId = m.away_team!.id;
    
    // Use ranking or default to 50 (as seen in your logs)
    const homeRank = m.home_team?.ranking || 50;
    const awayRank = m.away_team?.ranking || 50;

    // ... rest of your simulation logic
  });
}

// Add any other functions your file might have below...