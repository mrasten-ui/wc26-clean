export type MatchStatus = 'SCHEDULED' | 'FINISHED' | 'IN_PLAY';

export interface TeamData {
  id: string;
  name: string;
  group_id: string;
  fifa_ranking?: number; // ✅ FIXED: Added this field
}

export interface Match {
  id: number;
  home_team_id: string | null;
  away_team_id: string | null;
  home_code?: string;
  away_code?: string;
  home_score: number | null;
  away_score: number | null;
  kickoff_time: string;
  venue: string;
  stage: string;
  status: MatchStatus; // ✅ FIXED: Supports IN_PLAY
  winner_id?: string | null;
  home_team?: TeamData;
  away_team?: TeamData;
}

export interface Prediction {
  match_id: number;
  user_id: string;
  home_score: number | null;
  away_score: number | null;
  winner_id?: string | null;
}

export interface UserData {
  id: string;
  email: string;
  full_name?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  points: number;
  correct_scores: number;
  correct_results: number;
}

export type GlobalPredictions = Record<number, { home: number, away: number, draw: number }>;

export interface BracketMap {
  [key: string]: {
      name: string;
      sourceType: 'GROUP' | 'MATCH';
      sourceId?: string | number;
      predictedTeamId?: string | null; // ✅ FIXED: Allows nulls
  };
}