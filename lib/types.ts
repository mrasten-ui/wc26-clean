// lib/types.ts

/**
 * Defines the structure for a World Cup Team.
 */
export interface TeamData {
    id: string; // FIFA 3-letter code (e.g., 'ARG', 'SCO')
    name: string; // Full team name
    group_id: string; // Group letter (e.g., 'A', 'K')
    fifa_ranking: number; // For tie-breaking/seeding
    flag_emoji: string;
    // Add any other team fields you use in your database here
}

/**
 * Defines the structure for a World Cup Match.
 */
export interface Match {
    id: number; // Match ID (1-104)
    stage: 'GROUP' | 'R32' | 'R16' | 'QF' | 'SF' | '3RD' | 'FINAL';
    kickoff_time: Date | string;
    venue: string;

    // For Group Stage: Direct team IDs
    home_team_id: string | null;
    away_team_id: string | null;

    // For Knockout Stage: Codes pointing to previous match winners/group positions
    home_code: string | null; // e.g., 'W49', '1A'
    away_code: string | null; // e.g., 'W50', '2B'

    // Status and actual result
    status: 'SCHEDULED' | 'FINISHED' | 'IN_PROGRESS';
    home_score: number | null;
    away_score: number | null;
    winner_id: string | null;

    // Relationships (for joining in Supabase/hooks)
    home_team: TeamData | null;
    away_team: TeamData | null;
}

/**
 * Defines the structure for a User's Prediction.
 */
export interface Prediction {
    id?: number; // Optional ID for upsert operations
    match_id: number;
    user_id: string;

    // Group Stage Prediction (Scores)
    home_score: number | null;
    away_score: number | null;

    // Knockout Prediction (Winner ID)
    winner_id: string | null; 
}


// ===========================================
// APPLICATION / UI STRUCTURES
// ===========================================

/**
 * User data stored in your 'users' or 'profiles' table.
 */
export interface UserData {
    id: string;
    email: string;
    full_name: string;
    reveal_tokens: number; // Used for "Peek at Rival"
    // Add any other user fields here
}

/**
 * Structure for the Leaderboard display.
 */
export interface LeaderboardEntry extends UserData {
    // 🔥 FIX: Explicitly include user_id to resolve the 'l.user_id' error
    user_id: string; 
    total_points: number;
    rank: number;
    // ... add more stats if needed (perfect scores, etc.)
}

/**
 * Structure containing all predictions from all users.
 */
export interface GlobalPredictions {
    [userId: string]: {
        full_name: string;
        predictions: Record<number, Prediction>;
    }
}

/**
 * Structure defining how a bracket slot is resolved.
 */
export interface BracketMap {
    [code: string]: { // Key is the placeholder (e.g., '1A', 'W1')
        name: string;
        sourceType: 'GROUP' | 'MATCH';
        sourceId: string | number;
        predictedTeamId: string | null; // The resolved team ID ('ARG', 'SCO')
    };
}