"use client";
import { Match, Prediction, BracketMap, TeamData } from "../lib/types";
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
  t: any;
  getTeamName: (id: string, def: string) => string;
}

export default function Bracket({
  activeKnockoutRound,
  setActiveKnockoutRound,
  matches,
  predictions,
  bracketMap, // <--- This contains the calculated team positions
  teamsMap,
  handlePredict,
  champion,
  t,
  getTeamName
}: BracketProps) {
  
  // Helper: Get Team Details
  const getTeam = (id: string | null | undefined) => {
    if (!id) return { id: null, name: "TBD", flag: getFlagUrl('placeholder') };
    if (teamsMap[id]) {
      return { id, name: getTeamName(id, teamsMap[id].name), flag: getFlagUrl(id) };
    }
    return { id: id, name: id, flag: getFlagUrl('placeholder') };
  };

  const MatchCard = ({ match }: { match: Match }) => {
    const pred = predictions[match.id] || {};
    
    // ✅ CRITICAL FIX: Use bracketMap to find who is actually playing
    const resolvedHomeId = bracketMap[match.id]?.home || match.home_team_id;
    const resolvedAwayId = bracketMap[match.id]?.away || match.away_team_id;

    const homeTeam = getTeam(resolvedHomeId || match.home_code);
    const awayTeam = getTeam(resolvedAwayId || match.away_code);
    
    const isLocked = !resolvedHomeId || !resolvedAwayId;

    return (
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 mb-4 ${isLocked ? 'opacity-70' : ''}`}>
        <div className="bg-slate-50 px-4 py-2 text-[10px] font-bold text-slate-500 border-b border-slate-100 uppercase">
           {match.venue || "TBD"}
        </div>
        <div className="flex flex-col p-2 gap-2">
          {/* HOME TEAM */}
          <button 
            disabled={isLocked}
            onClick={() => handlePredict(match.id, 'winner_id', homeTeam.id)}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${pred.winner_id === homeTeam.id ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'border-slate-100 hover:bg-slate-50'}`}
          >
             <div className="flex items-center gap-3">
                 <img src={homeTeam.flag} className="w-8 h-5 object-cover rounded shadow-sm" />
                 <span className="font-bold text-sm text-slate-900">{homeTeam.name}</span>
             </div>
             {pred.winner_id === homeTeam.id && <span className="text-green-600">✔</span>}
          </button>

          {/* AWAY TEAM */}
          <button 
            disabled={isLocked}
            onClick={() => handlePredict(match.id, 'winner_id', awayTeam.id)}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${pred.winner_id === awayTeam.id ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'border-slate-100 hover:bg-slate-50'}`}
          >
             <div className="flex items-center gap-3">
                 <img src={awayTeam.flag} className="w-8 h-5 object-cover rounded shadow-sm" />
                 <span className="font-bold text-sm text-slate-900">{awayTeam.name}</span>
             </div>
             {pred.winner_id === awayTeam.id && <span className="text-green-600">✔</span>}
          </button>
        </div>
      </div>
    );
  };

  const stageMatches = matches.filter(m => m.stage === activeKnockoutRound);

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {champion && activeKnockoutRound === 'FINAL' && (
          <div className="mb-8 p-6 bg-yellow-100 border-2 border-yellow-400 rounded-xl text-center">
              <h3 className="text-yellow-800 font-bold uppercase tracking-widest text-xs mb-2">My Champion</h3>
              <div className="text-3xl font-black text-slate-900">{getTeamName(champion, teamsMap[champion]?.name || champion)}</div>
          </div>
      )}
      
      {stageMatches.length > 0 ? (
        stageMatches.map(match => <MatchCard key={match.id} match={match} />)
      ) : (
        <div className="text-center p-12 text-slate-400">No matches available for this round yet.</div>
      )}
    </div>
  );
}