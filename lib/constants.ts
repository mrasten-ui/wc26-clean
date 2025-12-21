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

// ✅ FIXED: Added 'authSuccess' and other login keys to ALL languages
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
    gd: "GD",
    authSuccess: "Check your email for the confirmation link!",
    login: "Login",
    signUp: "Sign Up",
    fullName: "Full Name",
    email: "Email Address",
    password: "Password",
    enter: "Enter Stadium",
    createAccount: "Create Account"
  },
  no: {
    appName: "The Rasten Cup '26",
    loading: "Laster VM Data...",
    groupStage: "Grupper",
    knockout: "Sluttspill",
    matches: "Kamper",
    results: "Tabellen",
    autoFill: "Auto-Fyll",
    processing: "Lagrer...",
    points: "P",
    played: "K",
    gd: "MF",
    authSuccess: "Sjekk e-posten din for bekreftelseslink!",
    login: "Logg Inn",
    signUp: "Registrer",
    fullName: "Fullt Navn",
    email: "E-postadresse",
    password: "Passord",
    enter: "Gå til Stadion",
    createAccount: "Opprett Konto"
  },
  us: {
    appName: "The Rasten Cup '26",
    loading: "Loading World Cup Data...",
    groupStage: "Groups",
    knockout: "Knockout",
    matches: "Matches",
    results: "Standings",
    autoFill: "Auto-Fill",
    processing: "Saving...",
    points: "Pts",
    played: "Pl",
    gd: "GD",
    authSuccess: "Check your email for the confirmation link!",
    login: "Login",
    signUp: "Sign Up",
    fullName: "Full Name",
    email: "Email Address",
    password: "Password",
    enter: "Enter Stadium",
    createAccount: "Create Account"
  },
  sc: {
    appName: "The Rasten Cup '26",
    loading: "Loading World Cup Data...",
    groupStage: "Groups",
    knockout: "Knockout",
    matches: "Fixtures",
    results: "The Table",
    autoFill: "Auto-Fill",
    processing: "Saving...",
    points: "Pts",
    played: "Pl",
    gd: "GD",
    authSuccess: "Check yer email for the link!",
    login: "Login",
    signUp: "Sign Up",
    fullName: "Full Name",
    email: "Email Address",
    password: "Password",
    enter: "Enter Stadium",
    createAccount: "Create Account"
  }
};

// ✅ FIXED: Explicitly typed as Record<string, string> to fix red lines in page.tsx
export const TEAM_NAMES: Record<string, Record<string, string>> = {
    en: { "AFG": "Afghanistan" },
    no: { "AFG": "Afghanistan" },
    us: { "AFG": "Afghanistan" },
    sc: { "AFG": "Afghanistan" }
};

export const TEAM_NICKNAMES: Record<string, Record<string, string>> = {
    en: { "BRA": "Seleção" }
};

export const TEAM_NAMES_NO: Record<string, string> = {
    "NOR": "Norge"
};