// ===================================
// CORE CONFIGURATION
// ===================================
export const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
export const KNOCKOUT_STAGES = ["R32", "R16", "QF", "SF", "3RD", "FINAL", "TREE"];

// COLOR PALETTE (Updated to your exact Royal Blue)
export const COLORS = {
  navy: "#154284", // UPDATED: The True Rasten Navy
  gold: "#fbbf24",
  light: "#f8fafc",
  red: "#ef4444",
};

export const STAGE_COLORS: Record<string, string> = {
  "A": "#3b82f6", "B": "#ef4444", "C": "#22c55e", "D": "#eab308",
  "E": "#a855f7", "F": "#ec4899", "G": "#06b6d4", "H": "#f97316",
  "I": "#14b8a6", "J": "#8b5cf6", "K": "#84cc16", "L": "#f43f5e",
  "R32": "#64748b", "R16": "#475569", "QF": "#334155", "SF": "#1e293b",
  "3RD": "#94a3b8", "FINAL": "#fbbf24", "TREE": "#10b981"
};

export const VENUE_ZONES: Record<string, string> = { "east": "Eastern", "central": "Central", "west": "Western" };

// ===================================
// TEAM NAMES & NICKNAMES
// ===================================
export const TEAM_NAMES: Record<string, Record<string, string>> = {
  en: { "USA": "USA", "MEX": "Mexico", "CAN": "Canada", "SCO": "Scotland", "NOR": "Norway" },
  no: { "USA": "USA", "MEX": "Mexico", "CAN": "Canada", "SCO": "Skottland", "NOR": "Norge" },
  us: { "USA": "USA", "MEX": "Mexico", "CAN": "Canada", "SCO": "Scotland", "NOR": "Norway" },
  sc: { "USA": "USA", "MEX": "Mexico", "CAN": "Canada", "SCO": "Scotland", "NOR": "Norway" },
};

export const TEAM_NICKNAMES: Record<string, Record<string, string>> = {
  en: { "USA": "Stars & Stripes", "MEX": "El Tri", "SCO": "The Tartan Army" },
  no: { "USA": "Yankees", "MEX": "El Tri", "SCO": "Tartanhæren" },
  us: { "USA": "The Yanks", "MEX": "El Tri" },
  sc: { "USA": "The Yanks", "MEX": "El Tri", "SCO": "The Tartan Army" }
};

export const TEAM_NAMES_NO: Record<string, string> = {}; 

// TRANSLATIONS
export const TRANSLATIONS = {
  en: {
    appName: "The Rasten Cup '26", loading: "Loading...", group: "Group", matchCenter: "Match Center", groupStage: "GROUPS", knockout: "KNOCKOUT", results: "THE TABLE", rules: "Rules", menuNicknames: "Show Nicknames", logout: "Log Out", yesterday: "Yesterday", today: "Today", tomorrow: "Tomorrow", roundOf: "Round of", thirdPlace: "3rd Place Playoff", final: "The Final", treeTitle: "Tournament Tree",
    tapLogo: "Tap logo for Intro", logIn: "Log In", signUp: "Sign Up", fullName: "Full Name / Nickname", email: "Email Address", password: "Password", createAccount: "Create Account", enterArena: "Enter Arena", processing: "Processing...",
    authSuccess: "Account created! Check your email to verify and then log in.",
    peekAtRival: "Peek at a rival", confirmReveal: "Reveal pick? (1 Token)", selectPlayer: "Select Player...", predictFirst: "Predict first to peek!", noPrediction: "This player hasn't predicted yet.", thirdPlaceTitle: "Third Place Rankings", completeToSee: "Complete all group predictions to see qualifiers", top8: "Top 8 Qualify", goToKnockout: "Go to Knockout Bracket", championPick: "Your Champion",
  },
  no: {
    appName: "Rasten Cup '26", loading: "Laster...", group: "Gruppe", matchCenter: "Kampsenter", groupStage: "GRUPPESPILL", knockout: "SLUTTSPILL", results: "TABELLEN", rules: "Regler", menuNicknames: "Vis Kallenavn", logout: "Logg Ut", yesterday: "I Går", today: "I Dag", tomorrow: "I Morgen", roundOf: "Runde av", thirdPlace: "Bronsefinale", final: "Finalen", treeTitle: "Turnerings-tre",
    tapLogo: "Trykk logo for Intro", logIn: "Logg Inn", signUp: "Registrer Deg", fullName: "Fullt Navn / Kallenavn", email: "E-postadresse", password: "Passord", createAccount: "Opprett Konto", enterArena: "Gå til Arenaen", processing: "Behandler...",
    authSuccess: "Konto opprettet! Sjekk e-post for å bekrefte, og logg deretter inn.",
    peekAtRival: "Se hva rivalen tippet", confirmReveal: "Avsløre tips? (1 Poeng)", selectPlayer: "Velg Spiller...", predictFirst: "Tipp først for å se!", noPrediction: "Denne spilleren har ikke tippet enda.", thirdPlaceTitle: "3. Plass Tabell", completeToSee: "Fullfør alle tips for å se hvem som går videre", top8: "Topp 8 går videre", goToKnockout: "Gå til Sluttspill", championPick: "Din Vinner",
  },
  us: {
    appName: "The Rasten Cup '26", loading: "Loading...", group: "Group", matchCenter: "Match Center", groupStage: "GROUPS", knockout: "BRACKET", results: "STANDINGS", rules: "Rules", menuNicknames: "Show Nicknames", logout: "Log Out", yesterday: "Yesterday", today: "Today", tomorrow: "Tomorrow", roundOf: "Round of", thirdPlace: "3rd Place Playoff", final: "The Final", treeTitle: "Tournament Tree",
    tapLogo: "Check out the Intro Video!", logIn: "Sign In", signUp: "Sign Up", fullName: "Full Name / Handle", email: "Email Address", password: "Password", createAccount: "Create Account", enterArena: "Get In There!", processing: "Processing...",
    authSuccess: "Account created! Check your email to verify and then sign in.",
    peekAtRival: "Peek at a rival's pick", confirmReveal: "Reveal pick? (1 Token)", selectPlayer: "Select Player...", predictFirst: "Predict first to peek!", noPrediction: "This user hasn't dropped a pick yet.", thirdPlaceTitle: "Third Place Rankings", completeToSee: "Complete all group predictions to see qualifiers", top8: "Top 8 Advance", goToKnockout: "Go to Knockout Bracket", championPick: "Your Champion",
  },
  sc: {
    appName: "The Rasten Cup '26", loading: "Loading, aye?", group: "Group", matchCenter: "Match Centre", groupStage: "THE GROUPS", knockout: "KNOCKOUTS", results: "THE LADDER", rules: "The Wee Rules", menuNicknames: "Show Nicknames", logout: "Away Ye Go", yesterday: "Yisterday", today: "The Day", tomorrow: "The Morn", roundOf: "Round O'", thirdPlace: "3rd Place Scramble", final: "The Final", treeTitle: "The Tournament Tree",
    tapLogo: "Gie's a wee look at the Intro", logIn: "Get Yersel' In", signUp: "Sign Up", fullName: "Your Handle / Nickname", email: "E-mail Address", password: "Password", createAccount: "C'reate Account", enterArena: "Get Aboard!", processing: "Haud On...",
    authSuccess: "Account created! Check your email, aye, then get yersel' logged in.",
    peekAtRival: "Have a wee peek at a rival", confirmReveal: "Reveal pick? (1 Token)", selectPlayer: "Select Yer Rival...", predictFirst: "Ye must predict first!", noPrediction: "They haven't bothered predicting yet.", thirdPlaceTitle: "3rd Place Wee Ladder", completeToSee: "Finish yer predictions tae see the next round", top8: "Top 8 Go Through", goToKnockout: "Go to Knockout Bracket", championPick: "Yer Champion",
  },
};