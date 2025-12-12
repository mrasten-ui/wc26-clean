export const getFlagUrl = (teamId: string) => {
    // Uses FlagCDN. You might need a mapper for FIFA codes (USA -> us) if they differ.
    // Assuming teamId is a 3-letter code like 'USA', 'FRA'.
    // Quick mapping for common codes to ISO 2-letter codes:
    const map: Record<string, string> = {
        "USA": "us", "MEX": "mx", "CAN": "ca", "ARG": "ar", "BRA": "br", 
        "FRA": "fr", "GER": "de", "ESP": "es", "ENG": "gb-eng", "POR": "pt",
        "NOR": "no", "SCO": "gb-sct"
    };
    const code = map[teamId] || teamId.substring(0, 2).toLowerCase();
    return `https://flagcdn.com/w40/${code}.png`;
};