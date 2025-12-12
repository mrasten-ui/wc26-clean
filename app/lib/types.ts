export type Match = {
  id: number;
  stage: string;
  kickoff_time: string;
  venue: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  status: string; // 'SCHEDULED' | 'IN_PLAY' | 'FINISHED'
  home_team: {
    id: string;
    name: string;
    group_id: string;
    fifa_ranking: number;
    flag_emoji: string;
  };
  away_team: {
    id: string;
    name: string;
    group_id: string;
    fifa_ranking: number;
    flag_emoji: string;
  };
};

export type Prediction = {
  user_id: string;
  match_id: number;
  home_score: number | null;
  away_score: number | null;
  winner_id: string | null;
  is_auto?: boolean;
  orig_home_score?: number | null;
  orig_away_score?: number | null;
  orig_winner_id?: string | null;
};

export type LeaderboardEntry = {
  user_id: string;
  display_name: string;
  total_points: number;
  group_points: number;
  ko_points: number;
  rank: number;
};

export type GlobalPredictions = Record<number, Record<string, Prediction>>;