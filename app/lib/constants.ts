export const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export const KNOCKOUT_STAGES = ["R32", "R16", "QF", "SF", "3RD", "FINAL", "TREE"];

export const COLORS = {
  navy: "#0f172a", // Slate-900
  gold: "#fbbf24", // Amber-400
  light: "#f8fafc", // Slate-50
  red: "#ef4444",   // Red-500
};

export const STAGE_COLORS: Record<string, string> = {
  "A": "#3b82f6", "B": "#ef4444", "C": "#22c55e", "D": "#eab308",
  "E": "#a855f7", "F": "#ec4899", "G": "#06b6d4", "H": "#f97316",
  "I": "#14b8a6", "J": "#8b5cf6", "K": "#84cc16", "L": "#f43f5e",
  "R32": "#64748b", "R16": "#475569", "QF": "#334155", "SF": "#1e293b",
  "3RD": "#94a3b8", "FINAL": "#fbbf24", "TREE": "#10b981"
};

export const VENUE_ZONES: Record<string, string> = {
  "east": "Eastern",
  "central": "Central",
  "west": "Western"
};

export const TEAM_NAMES: Record<string, Record<string, string>> = {
  en: { "USA": "USA", "Mexico": "Mexico", "Canada": "Canada" },
  no: { "USA": "USA", "Mexico": "Mexico", "Canada": "Canada" }
};

export const TEAM_NICKNAMES: Record<string, Record<string, string>> = {
  en: { "USA": "Stars & Stripes", "Mexico": "El Tri" },
  no: { "USA": "Yankees", "Mexico": "El Tri" }
};

export const TEAM_NAMES_NO: Record<string, string> = {
  "Spain": "Spania", "Germany": "Tyskland", "France": "Frankrike", "Italy": "Italia",
  "Brazil": "Brasil", "Netherlands": "Nederland", "Belgium": "Belgia", "Portugal": "Portugal",
  "Switzerland": "Sveits", "Denmark": "Danmark", "Sweden": "Sverige", "Norway": "Norge",
  "Croatia": "Kroatia", "Poland": "Polen", "Turkey": "Tyrkia", "Austria": "Østerrike",
  "Hungary": "Ungarn", "Czechia": "Tsjekkia", "Greece": "Hellas", "Ukraine": "Ukraina"
};

export const TRANSLATIONS = {
  en: {
    loading: "Loading the Rasten Cup...",
    group: "Group",
    matchCenter: "Match Center",
    groupStage: "GROUPS",
    knockout: "KNOCKOUT",
    results: "THE TABLE",
    rules: "Rules",
    menuNicknames: "Show Nicknames",
    logout: "Log Out",
    yesterday: "Yesterday",
    today: "Today",
    tomorrow: "Tomorrow",
    peekAtRival: "Peek at a rival",
    confirmReveal: "Reveal this player's pick?",
    selectPlayer: "Select Player...",
    predictFirst: "Predict first to peek!",
    noPrediction: "This player hasn't predicted this match yet.",
    thirdPlaceTitle: "Third Place Rankings",
    completeToSee: "Complete all group predictions to see qualifiers",
    top8: "Top 8 Qualify",
    goToKnockout: "Go to Knockout Bracket",
    treeTitle: "Tournament Tree",
    championPick: "Your Champion",
    roundOf: "Round of",
    thirdPlace: "3rd Place Playoff",
    final: "The Final"
  },
  no: {
    loading: "Laster Rasten Cup...",
    group: "Gruppe",
    matchCenter: "Kampsenter",
    groupStage: "GRUPPESPILL",
    knockout: "SLUTTSPILL",
    results: "TABELLEN",
    rules: "Regler",
    menuNicknames: "Vis Kallenavn",
    logout: "Logg Ut",
    yesterday: "I Går",
    today: "I Dag",
    tomorrow: "I Morgen",
    peekAtRival: "Se hva rivalen tippet",
    confirmReveal: "Avsløre denne spillerens tips?",
    selectPlayer: "Velg Spiller...",
    predictFirst: "Tipp først for å se!",
    noPrediction: "Denne spilleren har ikke tippet enda.",
    thirdPlaceTitle: "3. Plass Tabell",
    completeToSee: "Fullfør alle tips for å se hvem som går videre",
    top8: "Topp 8 går videre",
    goToKnockout: "Gå til Sluttspill",
    treeTitle: "Turnerings-tre",
    championPick: "Din Vinner",
    roundOf: "Runde av",
    thirdPlace: "Bronsefinale",
    final: "Finalen"
  },
  us: { /* Same as EN */ },
  sc: { /* Scottish slang */ }
};