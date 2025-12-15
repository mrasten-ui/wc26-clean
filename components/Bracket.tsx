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
  handleBonusPick: (championId: string) => void;
  t: any;
  lang: string;
  venueZones: Record<string, string>;
  getTeamName: (id: string, def: string) => string;
  teamNamesNo: Record<string, string>;
}

// Helper to check if a stage is fully predicted
const isStageComplete = (stageMatches: Match[], predictions: Record<number, Prediction>) => {
    if (stageMatches.length === 0) return false;
    return stageMatches.every(m => predictions[m.id]?.winner_id);
};

const PREV_STAGE_MAP: Record<string, string> = {
    'R16': 'R32',
    'QUARTER_FINAL': 'R16',
    'SEMI_FINAL': 'QUARTER_FINAL',
    'THIRD_PLACE': 'SEMI_FINAL',
    'FINAL': 'SEMI_FINAL'
};

const getStageName = (stage: string, t: any) => t[stage.toLowerCase()] || stage.replace('_', ' ');

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
  t,
  getTeamName
}: BracketProps) {
  
  const getTeam = (id: string) => {
    // 1. If it's a real team ID, return it
    if (teamsMap[id]) {
      return { 
        id, 
        name: getTeamName(id, teamsMap[id].name),
        flag: getFlagUrl(id) 
      };
    }
    
    // 2. If it's a placeholder (W73), check our MAPPED PREDICTIONS
    const predictedId = bracketMap[id]?.predictedTeamId;
    if (predictedId && teamsMap[predictedId]) {
       const sourceTeam = teamsMap[predictedId];
       return {
           id: predictedId,
           name: getTeamName(predictedId, sourceTeam?.name || predictedId),
           flag: getFlagUrl(predictedId)
       };
    }

    // 3. Fallback to "Winner Match X"
    const fallbackName = bracketMap[id]?.name || id;
    return { 
      id: id, 
      name: isTournamentComplete ? fallbackName : id, 
      flag: getFlagUrl('placeholder') 
    };
  };

  const prevStage = PREV_STAGE_MAP[activeKnockoutRound];
  const prevStageMatches = prevStage ? matches.filter(m => m.stage === prevStage) : [];
  const isPrevStageComplete = prevStage ? isStageComplete(prevStageMatches, predictions) : true;
  
  // Soft Lock: Just disables buttons, doesn't hide content
  const isLocked = !isPrevStageComplete && !!prevStage;

  // Navigation Logic
  const linearStages = knockoutStages.filter(s => s !== 'TREE');
  const currentIndex = linearStages.indexOf(activeKnockoutRound);
  const nextStage = linearStages[currentIndex + 1];

  const handleNext = () => {
      if (nextStage) {
          setActiveKnockoutRound(nextStage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
          setActiveKnockoutRound('TREE');
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  const MatchCard = ({ match, isTreeMode = false }: { match: Match, isTreeMode?: boolean }) => {
    const pred = predictions[match.id] || {};
    const homeTeam = getTeam(match.home_team_id || match.home_code || '');
    const awayTeam = getTeam(match.away_team_id || match.away_code || '');
    
    // ✅ THE FIX: Ignore match.status or match.winner_id. 
    // We ONLY care about what the user clicked (pred.winner_id).
    const matchWinnerId = pred.winner_id;

    const isHomeResolved = !homeTeam.name.includes("Winner") && !homeTeam.name.includes("Runner-up");
    const isAwayResolved = !awayTeam.name.includes("Winner") && !awayTeam.name.includes("Runner-up");
    
    // Disable if the user hasn't unlocked this round by predicting previous rounds
    const isDisabled = isLocked || !isHomeResolved || !isAwayResolved;

    const formatDate = new Date(match.kickoff_time.toString()).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
    const formatTime = new Date(match.kickoff_time.toString()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md ${isTreeMode ? 'min-w-[300px] mb-4' : 'mb-6'} ${isLocked ? 'opacity-60 grayscale-[0.5]' : ''}`}>
        <div className="bg-slate-50/80 px-4 py-2 flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100 tracking-wider">
          <span>{formatDate} <span className="text-slate-300 mx-1">|</span> {formatTime}</span>
          <span className="text-slate-400 max-w-[100px] truncate text-right">{match.venue === 'TBD' ? 'TBD' : match.venue}</span>
        </div>
        <div className={`flex ${isTreeMode ? 'flex-col gap-1 p-2' : 'flex-col md:flex-row items-stretch p-2 gap-2 md:gap-0'}`}>
          
          {/* HOME TEAM */}
          <button 
            onClick={() => handlePredict(match.id, 'winner_id', homeTeam.id)}
            disabled={isDisabled}
            className={`flex-1 flex items-center justify-between p-3 rounded-lg transition-all relative overflow-hidden ${
                matchWinnerId === homeTeam.id 
                 ? 'bg-green-50 ring-2 ring-green-400 shadow-[0_0_10px_rgba(74,222,128,0.3)] z-10' 
                 : 'hover:bg-slate-50 border border-transparent'
            } ${isDisabled ? 'cursor-not-allowed' : ''}`}
          >
             <div className="flex items-center gap-3">
                 {!isHomeResolved ? <div className="w-8 h-5 rounded bg-slate-200" /> : <img src={homeTeam.flag} className="w-8 h-5 object-cover rounded shadow-sm ring-1 ring-black/5" />}
                 <span className={`font-bold text-sm ${matchWinnerId === homeTeam.id ? 'text-green-900' : 'text-slate-700'}`}>{homeTeam.name}</span>
             </div>
             {matchWinnerId === homeTeam.id && <div className="text-green-500"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" /></svg></div>}
          </button>

          {!isTreeMode && <div className="flex items-center justify-center py-1 md:px-2"><span className="text-[10px] font-black text-slate-300 uppercase">VS</span></div>}

          {/* AWAY TEAM */}
          <button 
            onClick={() => handlePredict(match.id, 'winner_id', awayTeam.id)}
            disabled={isDisabled}
            className={`flex-1 flex items-center justify-between p-3 rounded-lg transition-all relative overflow-hidden ${isTreeMode ? '' : 'flex-row-reverse md:flex-row'} ${
                matchWinnerId === awayTeam.id 
                 ? 'bg-green-50 ring-2 ring-green-400 shadow-[0_0_10px_rgba(74,222,128,0.3)] z-10' 
                 : 'hover:bg-slate-50 border border-transparent'
            } ${isDisabled ? 'cursor-not-allowed' : ''}`}
          >
             {matchWinnerId === awayTeam.id ? <div className="text-green-500"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" /></svg></div> : <div className="w-5" />} 
             <div className={`flex items-center gap-3 ${isTreeMode ? '' : 'md:flex-row-reverse'}`}>
                 {!isAwayResolved ? <div className="w-8 h-5 rounded bg-slate-200" /> : <img src={awayTeam.flag} className="w-8 h-5 object-cover rounded shadow-sm ring-1 ring-black/5" />}
                 <span className={`font-bold text-sm ${matchWinnerId === awayTeam.id ? 'text-green-900' : 'text-slate-700'}`}>{awayTeam.name}</span>
             </div>
          </button>
        </div>
      </div>
    );
  };

  const ChampionBanner = () => (
      activeKnockoutRound === 'FINAL' && (
        <div className="bg-white rounded-xl shadow-xl p-8 text-center border-4 border-yellow-400 mb-10 relative overflow-hidden animate-in fade-in slide-in-from-top-4">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300" />
            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">{t.championPick}</h2>
            {champion ? (
                <div className="flex flex-col items-center">
                    <div className="relative"><img src={getFlagUrl(champion)} className="w-24 h-16 object-cover rounded-lg shadow-2xl ring-4 ring-white" /><div className="absolute -bottom-3 -right-3 text-3xl animate-bounce-slow">🏆</div></div>
                    <span className="text-3xl font-black text-slate-900 mt-4">{getTeamName(champion, teamsMap[champion]?.name || champion)}</span>
                    <p className="text-sm font-bold text-yellow-600 uppercase tracking-widest mt-2">World Champion 2026</p>
                </div>
            ) : (
                <div className="p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200"><p className="text-slate-400 font-bold">{t.predictChampion || 'Predict the Final winner to reveal your Champion!'}</p></div>
            )}
        </div>
      )
  );

  if (activeKnockoutRound === 'TREE') {
      const rounds = ['R32', 'R16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL'];
      return (
          <div className="w-full overflow-x-auto pb-12">
             <div className="flex gap-8 min-w-max px-4">
                 {rounds.map(stage => {
                     const ms = matches.filter(m => m.stage === stage);
                     return (
                         <div key={stage} className="flex flex-col gap-4 w-[320px]">
                             <h3 className="text-center font-black text-slate-400 uppercase tracking-widest mb-4 sticky top-0 bg-slate-100/90 backdrop-blur py-2 rounded-lg z-10">{getStageName(stage, t)}</h3>
                             {ms.map(m => <MatchCard key={m.id} match={m} isTreeMode={true} />)}
                         </div>
                     )
                 })}
             </div>
          </div>
      );
  }

  const stageMatches = matches.filter(m => m.stage === activeKnockoutRound);

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      <ChampionBanner />
      <div className="flex flex-col gap-2 relative">
        {isLocked && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-4 flex items-center justify-between shadow-sm animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3 text-orange-800">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" /></svg>
                    <div><span className="font-bold">Locked Round:</span> Complete {getStageName(prevStage, t)} first.</div>
                </div>
                <button onClick={() => setActiveKnockoutRound(prevStage)} className="px-4 py-1.5 bg-white border border-orange-300 text-orange-700 text-xs font-bold rounded-lg hover:bg-orange-100 transition-colors">Go Back</button>
            </div>
        )}

        {isTournamentComplete ? (
          stageMatches.length > 0 ? (
            stageMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
             <div className="bg-white p-12 rounded-xl text-center text-slate-400 border border-slate-200"><p className="text-lg font-bold">{t.predictKnockout || 'Select a match to predict the winner.'}</p></div>
          )
        ) : (
          <div className="bg-white p-8 rounded-xl text-center border-l-4 border-orange-400 shadow-sm"><h3 className="text-lg font-bold text-slate-800 mb-2">Locked</h3><p className="text-slate-500">{t.completeGroupPredictions || 'Complete all group stage predictions to unlock the Knockout Bracket!'}</p></div>
        )}
      </div>
      
      {stageMatches.length > 0 && isTournamentComplete && (
          <div className="mt-8 pt-6 border-t border-slate-200/50">
              <button 
                 onClick={handleNext}
                 className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-95"
              >
                  <span>{nextStage ? `Next: ${getStageName(nextStage, t)}` : "View Full Tree"}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
              </button>
          </div>
      )}
    </div>
  );
}