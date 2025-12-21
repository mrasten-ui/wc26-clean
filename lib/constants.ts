// lib/constants.ts

export const COLORS = {
  navy: '#0f172a',
  blue: '#3b82f6',
  green: '#22c55e',
  gold: '#eab308',
  white: '#ffffff',
  red: '#ef4444'
};

export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export const KNOCKOUT_STAGES = [
  'ROUND_OF_32',
  'ROUND_OF_16',
  'QUARTER_FINAL',
  'SEMI_FINAL',
  'PLAY_OFF_FOR_THIRD_PLACE',
  'FINAL'
];

export const STAGE_COLORS: Record<string, string> = {
  'ROUND_OF_32': '#3b82f6',
  'ROUND_OF_16': '#6366f1',
  'QUARTER_FINAL': '#8b5cf6',
  'SEMI_FINAL': '#d946ef',
  'PLAY_OFF_FOR_THIRD_PLACE': '#f97316',
  'FINAL': '#eab308'
};

export const TRANSLATIONS = {
  en: {
    appName: "The Rasten Cup '26",
    loading: "Loading World Cup Data...",
    groupStage: "Groups",
    knockout: "Knockout",
    matches: "Matches",
    results: "The Table",
    autoFill: "Auto-Fill",
    processing: "Saving...",
    points: "Pts",
    played: "Pl",
    gd: "GD"
  },
  // Add other languages here if needed
};

// ✅ FIXED: Explicitly typed as Record<string, string> so TypeScript allows lookups
export const TEAM_NAMES: Record<string, Record<string, string>> = {
    en: {
        "AFG": "Afghanistan",
        // ... (Your team list goes here, or leave empty if using DB names)
    }
};

export const TEAM_NICKNAMES: Record<string, Record<string, string>> = {
    en: {
        "BRA": "Seleção",
        // ...
    }
};

export const TEAM_NAMES_NO: Record<string, string> = {
    "NOR": "Norge",
    // ...
};