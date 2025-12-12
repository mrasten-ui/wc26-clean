"use client";
import { Match, Prediction, BracketMap, TeamData } from "../lib/types";
import { COLORS, STAGE_COLORS } from "../lib/constants";
import { getFlagUrl } from "../lib/flags";

interface BracketProps {
  activeKnockoutRound: string;
  setActiveKnockoutRound: (stage: string) => void;
  knockoutStages: string[];
  matches: Match[];
  predictions: Record<number, Prediction>;
  bracketMap: BracketMap;
  teamsMap: Record<string, TeamData>;
  handlePredict: (matchId: number, field: "winner_id", value: any) => void;
  isTournamentComplete: boolean;
  champion: string | null;
  handleBonusPick: (championId: string) => void;
  t: any;
  lang: string;
  venueZones: Record<string, string>;
  getTeamName: (id: string, def: string) => string;
  teamNamesNo: Record<string, string>;
}

export default function Bracket({
  activeKnockoutRound,
  setActiveKnockoutRound,
  knockoutStages,
  matches,
  predictions,
  bracketMap,
  teamsMap,
  handlePredict,
  isTournamentComplete,
  champion,
  handleBonusPick,
  t,
  getTeamName
}: BracketProps) {
  
  // Filter matches for the active round
  const stageMatches = matches.filter(m => m.stage === activeKnockoutRound);

  // Helper to safely get team data (name, flag)
  const getTeam = (id: string) => {
    // 1. If the ID is a known FIFA code (e.g., 'ARG'), use the map
    if (teamsMap[id]) {
      return { 
        id, 
        name: getTeamName(id, teamsMap[id].name),
        flag: getFlagUrl(id) 
      };
    }
    
    // 2. If ID is a placeholder (e.g., 'W1A'), use bracketMap to find predicted team
    const predictedId = bracketMap[id]?.predictedTeamId;
    if (predictedId && teamsMap[predictedId]) {
       const sourceTeam = teamsMap[predictedId];
       return {
           id: predictedId,
           name: getTeamName(predictedId, sourceTeam?.name || predictedId),
           flag: getFlagUrl(predictedId)
       };
    }

    // 3. Fallback for placeholder or missing team
    const fallbackName = bracketMap[id]?.name || id;
    return { 
      id: id, 
      name: isTournamentComplete ? fallbackName : id, 
      flag: getFlagUrl('placeholder') // Placeholder image/default icon
    };
  };

  // Render a single match card
  const MatchCard = ({ match }: { match: Match }) => {
    const pred = predictions[match.id] || {};
    const homeTeam = getTeam(match.home_team_id || match.home_code || '');
    const awayTeam = getTeam(match.away_team_id || match.away_code || '');
    
    const isCompleted = match.status === 'FINISHED';
    const matchWinnerId = isCompleted ? match.winner_id : pred.winner_id;

    // Check if team slot has a resolved winner (i.e., not 'W1A' or 'R2B')
    const isHomeResolved = !homeTeam.name.includes("Winner") && !homeTeam.name.includes("Runner-up");
    const isAwayResolved = !awayTeam.name.includes("Winner") && !awayTeam.name.includes("Runner-up");
    
    // Date formatting (simplified for brevity)
    const formatTime = new Date(match.kickoff_time.toString()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formatDate = new Date(match.kickoff_time.toString()).toLocaleDateString([], { month: 'short', day: 'numeric' });

    return (
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden text-sm">
        
        {/* Header: Venue, Date, Time */}
        <div className="bg-slate-50 px-3 py-1.5 flex justify-between items-center text-[10px] font-bold uppercase border-b border-slate-100">
          <span className="text-slate-400">{match.venue}</span>
          <span className="text-slate-500">{formatDate} @ {formatTime}</span>
        </div>

        {/* Teams and Prediction Buttons */}
        <div className="grid grid-cols-2 gap-4 p-4">
          
          {/* HOME TEAM */}
          <div className={`flex flex-col items-center gap-2 p-1 rounded-lg ${isHomeResolved && matchWinnerId === homeTeam.id ? 'bg-green-50/50' : ''}`}>
            {!isHomeResolved ? (
                <div className="w-12 h-8 rounded-md bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 border border-slate-200 uppercase">{homeTeam.name}</div>
            ) : (
                <img src={homeTeam.flag} className="w-12 h-8 object-cover rounded shadow-sm" alt={homeTeam.name} />
            )}
            <span className={`text-center font-bold text-xs ${isHomeResolved ? 'text-slate-800' : 'text-slate-500'}`}>
              {homeTeam.name}
            </span>
            <button 
              onClick={() => handlePredict(match.id, 'winner_id', homeTeam.id)}
              disabled={isCompleted || !isHomeResolved}
              className={`w-full py-1 mt-1 text-xs font-black rounded transition-all active:scale-95 ${
                matchWinnerId === homeTeam.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : isHomeResolved 
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                    : 'bg-slate-50 text-slate-300 cursor-not-allowed'
              }`}
            >
              {matchWinnerId === homeTeam.id ? 'WINNER' : 'PICK'}
            </button>
          </div>
          
          {/* AWAY TEAM */}
          <div className={`flex flex-col items-center gap-2 p-1 rounded-lg ${isAwayResolved && matchWinnerId === awayTeam.id ? 'bg-green-50/50' : ''}`}>
            {!isAwayResolved ? (
                <div className="w-12 h-8 rounded-md bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 border border-slate-200 uppercase">{awayTeam.name}</div>
            ) : (
                <img src={awayTeam.flag} className="w-12 h-8 object-cover rounded shadow-sm" alt={awayTeam.name} />
            )}
            <span className={`text-center font-bold text-xs ${isAwayResolved ? 'text-slate-800' : 'text-slate-500'}`}>
              {awayTeam.name}
            </span>
            <button 
              onClick={() => handlePredict(match.id, 'winner_id', awayTeam.id)}
              disabled={isCompleted || !isAwayResolved}
              className={`w-full py-1 mt-1 text-xs font-black rounded transition-all active:scale-95 ${
                matchWinnerId === awayTeam.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : isAwayResolved
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                    : 'bg-slate-50 text-slate-300 cursor-not-allowed'
              }`}
            >
              {matchWinnerId === awayTeam.id ? 'WINNER' : 'PICK'}
            </button>
          </div>
          
        </div>
      </div>
    );
  };

  // The main rendering logic
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* 1. STAGE SELECTOR (Pill Bar) */}
      <div className="flex justify-center flex-wrap gap-2 p-3 rounded-xl shadow-lg border border-white/10" style={{ backgroundColor: COLORS.navy }}>
        {knockoutStages.filter(s => s !== 'TREE').map((s) => (
          <button
            key={s}
            onClick={() => setActiveKnockoutRound(s)}
            style={{ backgroundColor: s === 'FINAL' ? COLORS.gold : undefined }}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all shadow-md ${
              activeKnockoutRound === s
                ? "bg-white text-slate-900 scale-105 ring-2 ring-yellow-400"
                : s === 'FINAL' 
                  ? "text-slate-900 hover:bg-yellow-400/80"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {t[s.toLowerCase()] || s}
          </button>
        ))}
      </div>

      {/* 2. CHAMPION PICK (Displayed only if on Final tab) */}
      {activeKnockoutRound === 'FINAL' && (
        <div className="bg-white rounded-xl shadow-xl p-6 text-center border-4 border-yellow-400">
            <h2 className="text-xl font-black text-slate-900 mb-4">{t.championPick}</h2>
            
            {champion ? (
                <div className="flex flex-col items-center">
                    <img src={getFlagUrl(champion)} className="w-16 h-12 object-cover rounded shadow-md mb-2" />
                    <span className="text-lg font-extrabold text-green-700">{getTeamName(champion, teamsMap[champion]?.name || champion)}</span>
                    <p className="text-xs text-slate-500 mt-2">Predicted Winner of the Tournament</p>
                </div>
            ) : (
                <p className="text-slate-500">{t.predictChampion || 'Predict the Final winner to set your champion pick!'}</p>
            )}
        </div>
      )}

      {/* 3. MATCH LIST FOR ACTIVE ROUND */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isTournamentComplete ? (
          stageMatches.length > 0 ? (
            stageMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
             <div className="md:col-span-2 bg-white p-6 rounded-xl text-center text-slate-500">
                <p>{t.predictKnockout || 'Select a match to predict the winner.'}</p>
            </div>
          )
        ) : (
          <div className="md:col-span-2 bg-white p-6 rounded-xl text-center border-2 border-orange-400/50">
            <p className="font-bold text-orange-600">{t.completeGroupPredictions || 'Complete all group stage predictions to unlock the Knockout Bracket!'}</p>
          </div>
        )}
      </div>

    </div>
  );
}