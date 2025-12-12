// lib/flags.ts

// 1. HELPER: Map FIFA 3-letter codes to ISO 2-letter codes for FlagCDN
const TEAM_ISO_MAP: Record<string, string> = {
  // HOSTS
  "USA": "us", "MEX": "mx", "CAN": "ca",
  // CONMEBOL
  "ARG": "ar", "BRA": "br", "URU": "uy", "COL": "co", "ECU": "ec", "CHI": "cl", "PER": "pe", "PAR": "py",
  // UEFA
  "FRA": "fr", "ESP": "es", "ENG": "gb-eng", "BEL": "be", "POR": "pt", "NED": "nl", "ITA": "it",
  "GER": "de", "CRO": "hr", "SUI": "ch", "DEN": "dk", "AUT": "at", "UKR": "ua", "NOR": "no",
  "POL": "pl", "SCO": "gb-sct", "TUR": "tr", "SWE": "se", "WAL": "gb-wls", "CZE": "cz", "GRE": "gr",
  // CAF
  "MAR": "ma", "SEN": "sn", "EGY": "eg", "NGA": "ng", "GHA": "gh", "RSA": "za", "ALG": "dz", "CIV": "ci",
  // AFC
  "JPN": "jp", "KOR": "kr", "AUS": "au", "KSA": "sa", "IRN": "ir",
  // CONCACAF & OTHERS
  "CRC": "cr", "JAM": "jm", "NZL": "nz"
};

export const getFlagUrl = (code: string): string => {
  // 2. CHECK: Is it a Language Code? (Use FlagCDN)
  if (['no', 'us', 'sc', 'en'].includes(code)) {
    switch (code) {
      case 'no': return 'https://flagcdn.com/no.svg';      // Norway
      case 'us': return 'https://flagcdn.com/us.svg';      // USA
      case 'sc': return 'https://flagcdn.com/gb-sct.svg';  // Scotland
      case 'en': return 'https://flagcdn.com/gb.svg';      // UK/English
      default: return 'https://flagcdn.com/gb.svg';
    }
  }

  // 3. CHECK: Is it a Team ID? (Use FlagCDN)
  if (TEAM_ISO_MAP[code]) {
    return `https://flagcdn.com/${TEAM_ISO_MAP[code]}.svg`;
  }

  // 4. FALLBACK
  return 'https://flagcdn.com/un.svg'; 
};