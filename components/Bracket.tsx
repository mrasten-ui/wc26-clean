"use client";
import { useRef } from "react";
import { getFlagUrl } from "../lib/flags";
import { COLORS } from "../lib/constants";

interface BracketProps {
  activeKnockoutRound: string;
  setActiveKnockoutRound: (round: string) => void;
  knockoutStages: string[];
  matches: any[];
  predictions: any;
  bracketMap: any;
  teamsMap: any;
  handlePredict: (matchId: number, field: "home_score" | "away_score" | "winner_id", value: any) => void;
  isTournamentComplete: boolean;
  champion: string | null;
  handleBonusPick: (teamId: string) => void;
  t: any;
  lang: string;
  venueZones: any;
  getTeamName: (id: string, def: string) => string;
  teamNamesNo?: any;
}

export default function Bracket({
  activeKnockoutRound, setActiveKnockoutRound, knockoutStages, matches, predictions,
  bracketMap, teamsMap, handlePredict, isTournamentComplete, champion, handleBonusPick,
  t, lang, venueZones, getTeamName, teamNamesNo
}: BracketProps) {

  // --- SWIPE LOGIC ---
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
      if (!touchStartX.current || !touchEndX.current) return;
      const distance = touchStartX.current - touchEndX.current;
      const SWIPE_THRESHOLD = 50;
      const currentIndex = knockoutStages.indexOf(activeKnockoutRound);

      if (distance > SWIPE_THRESHOLD) { // Swipe Left -> Next
          if (currentIndex !== -1 && currentIndex < knockoutStages.length - 1) setActiveKnockoutRound(knockoutStages[currentIndex + 1]);
          else if (activeKnockoutRound === knockoutStages[knockoutStages.length - 1]) setActiveKnockoutRound("TREE");
      } else if (distance < -SWIPE_THRESHOLD) { // Swipe Right -> Prev
          if (activeKnockoutRound === "TREE") setActiveKnockoutRound(knockoutStages[knockoutStages.length - 1]);
          else if (currentIndex > 0) setActiveKnockoutRound(knockoutStages[currentIndex - 1]);
      }
      touchStartX.current = 0;
      touchEndX.current = 0;
  };

  // --- 1. TREE VIEW (Visual) ---
  if (activeKnockoutRound === "TREE") {
      return (
          <div 
            className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center animate-in zoom-in-95 duration-300"
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
          >
              <div className="bg-white p-6 rounded-3xl border-2 border-blue-100 shadow-[0_0_25px_rgba(59,130,246,0.15)] max-w-md w-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />
                  <h2 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter mt-4">{t.treeTitle || "TOURNAMENT TREE"}</h2>
                  <div className="w-full aspect-square bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center mb-6 relative">
                      <span className="text-6xl grayscale opacity-20">🌳</span>
                      <span className="absolute bottom-4 text-xs font-bold text-slate-400">Visual Bracket Coming Soon</span>
                  </div>
                  
                  {/* Bonus Pick Display */}
                  <div className="border-t border-slate-100 pt-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.championPick || "Your Champion"}</p>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-center gap-3 shadow-sm">
                          {champion ? (
                              <>
                                  <img src={getFlagUrl(champion)} className="w-8 h-5 object-cover rounded shadow-sm" />
                                  <span className="font-black text-slate-900">{getTeamName(champion, teamsMap[champion]?.name || champion)}</span>
                              </>
                          ) : (
                              <span className="text-slate-400 text-xs italic">Not selected</span>
                          )}
                      </div>
                  </div>
              </div>
              <div className="md:hidden text-center mt-8 opacity-30"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Swipe ↔</p></div>
          </div>
      );
  }

  // --- 2. STAGE MATCHES VIEW ---
  const stageMatches = matches.filter(m => {
      const stageCode = activeKnockoutRound; 
      // Simple normalizer
      if (stageCode === 'R32' && m.stage.includes('32')) return true;
      if (stageCode === 'R16' && m.stage.includes('16')) return true;
      if (stageCode === 'QF' && m.stage.includes('QUARTER')) return true;
      if (stageCode === 'SF' && m.stage.includes('SEMI')) return true;
      if (stageCode === '3RD' && (m.stage === '3RD_PLACE' || m.stage.includes('THIRD'))) return true;
      if (stageCode === 'FINAL' && m.stage === 'FINAL') return true;
      return false;
  });

  return (
    <div className="space-y-4 pb-24 min-h-[60vh]" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      
      {/* Stage Title */}
      <div className="text-center py-4 sticky top-16 z-10 bg-[#F5F7FA]/95 backdrop-blur-sm">
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase drop-shadow-sm">
              {activeKnockoutRound === '3RD' ? (t.thirdPlace || "3rd Place") : (activeKnockoutRound === 'FINAL' ? (t.final || "Final") : `${t.roundOf || "Round of"} ${activeKnockoutRound.replace(/\D/g, '') || activeKnockoutRound}`)}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{stageMatches.length} Matches</p>
      </div>

      {stageMatches.length === 0 ? (
          <div className="text-center py-12 text-slate-400"><p className="font-bold">No matches found for this stage.</p></div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500">
              {stageMatches.map((m) => {
                  const pred = predictions[m.id] || {};
                  // Try to resolve dynamic names from bracketMap, else fallback to team name
                  const homeId = bracketMap[`MATCH_HOME_${m.id}`] || bracketMap[m.home_team.id] || m.home_team.id;
                  const awayId = bracketMap[`MATCH_AWAY_${m.id}`] || bracketMap[m.away_team.id] || m.away_team.id;
                  
                  const homeTeam = teamsMap[homeId] || { name: `Winner ${m.home_team.id}` };
                  const awayTeam = teamsMap[awayId] || { name: `Winner ${m.away_team.id}` };
                  const winnerId = pred.winner_id;

                  return (
                      <div key={m.id} className={`bg-white rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border-2 transition-all overflow-hidden ${winnerId ? 'border-blue-300 shadow-blue-100' : 'border-blue-100'}`}>
                          
                          <div className="bg-slate-50/50 px-4 py-2 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wide border-b border-slate-100">
                              <span>Match {m.id}</span><span>{m.venue.split(',')[0]}</span>
                          </div>

                          <div className="p-4 flex items-center justify-between gap-4">
                              <button onClick={() => handlePredict(m.id, 'winner_id', homeId)} className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${winnerId === homeId ? 'bg-blue-50 ring-2 ring-blue-500 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}>
                                  <img src={getFlagUrl(homeId)} className="w-12 h-8 object-cover rounded shadow-sm" />
                                  <span className="text-xs font-bold text-center leading-tight text-slate-800">{getTeamName(homeId, homeTeam.name)}</span>
                                  {winnerId === homeId && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>}
                              </button>

                              <div className="flex flex-col items-center"><span className="text-xs font-black text-slate-300">VS</span></div>

                              <button onClick={() => handlePredict(m.id, 'winner_id', awayId)} className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${winnerId === awayId ? 'bg-blue-50 ring-2 ring-blue-500 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}>
                                  <img src={getFlagUrl(awayId)} className="w-12 h-8 object-cover rounded shadow-sm" />
                                  <span className="text-xs font-bold text-center leading-tight text-slate-800">{getTeamName(awayId, awayTeam.name)}</span>
                                  {winnerId === awayId && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>}
                              </button>
                          </div>
                      </div>
                  );
              })}
          </div>
      )}
      <div className="md:hidden text-center mt-6 opacity-30"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Swipe ↔</p></div>
    </div>
  );
}