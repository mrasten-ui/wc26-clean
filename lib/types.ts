export interface UserData {
  id: string;
  email?: string;
  username?: string;
}

export interface TeamData {
  id: string;
  name: string;
  group_id: string;
  fifa_ranking?: number; // Added for AI calculation
  iso_code?: string;
}

export interface Match {
  id: number;
  home_team_id: string | null;
  away_team_id: string | null;
  home_score?: number | null;
  away_score?: number | null;
  kickoff_time: string;
  stage: string;
  status: string;
  venue?: string;
  home_team?: { name: string; group_id: string; tbd_code?: string };
  away_team?: { name: string; group_id: string; tbd_code?: string };
  home_code?: string;
  away_code?: string;
  winner_id?: string | null;
}

export interface Prediction {
  match_id: number;
  user_id: string;
  home_score?: number | null;
  away_score?: number | null;
  winner_id?: string | null;
}

export interface GlobalPredictions {
  [matchId: number]: {
    home_wins: number;
    away_wins: number;
    draws: number;
    total: number;
  };
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  points: number;
  correct_scores: number;
  correct_outcomes: number;
}

// ✅ Added Standing Interface here so it can be imported
export interface Standing {
  teamId: string;
  points: number;
  gd: number;
  gf: number;
  ga: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
}

export interface BracketMap {
  [matchId: number]: {
    home: string | null;
    away: string | null;
  };
}