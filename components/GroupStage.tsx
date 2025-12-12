"use client";
import { useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { GROUPS } from "../lib/constants";
import { getFlagUrl } from "../lib/flags";

export default function GroupStage({ 
    getTeamName, activeTab, matchesByGroup, predictions, 
    handlePredict, leaderboard, allPredictions, user, revealCount, 
    handleRevealSelection, revealedMatches, t, lang, setActiveTab 
}: any) {

  // Local state to track which match card has the "Peek" dropdown open
  const [peekMatchId, setPeekMatchId] = useState<number | null>(null);

  // --- SWIPE LOGIC ---
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
      if (!touchStartX.current || !touchEndX.current) return;
      const distance = touchStartX.current - touchEndX.current;
      const SWIPE_THRESHOLD = 50;
      const currentIndex = GROUPS.indexOf(activeTab);

      if (distance > SWIPE_THRESHOLD) { // Swipe Left -> Next
          if (currentIndex !== -1 && currentIndex < GROUPS.length - 1) setActiveTab(GROUPS[currentIndex + 1]);
          else if (activeTab === GROUPS[GROUPS.length - 1]) setActiveTab("SUMMARY");
      } else if (distance < -SWIPE_THRESHOLD) { // Swipe Right -> Prev
          if (activeTab === "SUMMARY") setActiveTab(GROUPS[GROUPS.length - 1]);
          else if (currentIndex > 0) setActiveTab(GROUPS[currentIndex - 1]);
      }
      touchStartX.current = 0;
      touchEndX.current = 0;
  };

  const currentGroupMatches = matchesByGroup[activeTab] || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20" 
         onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      
      {/* HEADER (Group Title) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center sticky top-20 z-10">
          <button onClick={() => { const idx = GROUPS.indexOf(activeTab); if(idx > 0) setActiveTab(GROUPS[idx-1]); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">←</button>
          <div className="text-center">
              <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase">{t.group} {activeTab}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentGroupMatches.length} Matches</p>
          </div>
          <button onClick={() => { const idx = GROUPS.indexOf(activeTab); if(idx < GROUPS.length - 1) setActiveTab(GROUPS[idx+1]); else setActiveTab("SUMMARY"); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">→</button>
      </div>

      {/* MATCHES LIST */}
      <div className="space-y-4">
          {currentGroupMatches.map((m: any) => {
             const pred = predictions[m.id] || {};
             const isChanged = (pred.orig_home_score !== null && pred.orig_home_score !== undefined) && 
                               (pred.home_score !== pred.orig_home_score || pred.away_score !== pred.orig_away_score);
             const hasPrediction = pred.home_score !== null && pred.home_score !== undefined;

             return (
                <div key={m.id} className="bg-white rounded-2xl overflow-hidden relative transition-all border-2 border-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    
                    {/* Header: Venue & Date */}
                    <div className="bg-slate-50/50 px-4 py-2 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wide border-b border-slate-100">
                        <span>{format(parseISO(m.kickoff_time), "MMM d • HH:mm")}</span>
                        <span>{m.venue.split(',')[0]}</span>
                    </div>

                    {/* Match Content */}
                    <div className="p-4">
                        <div className="flex items-center justify-between gap-2">
                            {/* HOME */}
                            <div className="flex-1 flex flex-col items-center gap-2">
                                <img src={getFlagUrl(m.home_team.id)} className="w-12 h-8 object-cover rounded shadow-sm" />
                                <span className="text-xs font-bold text-center leading-tight text-slate-800 min-h-[2.5em] flex items-center justify-center">{getTeamName(m.home_team.id, m.home_team.name)}</span>
                                <input type="tel" inputMode="numeric" pattern="[0-9]*" className={`w-12 h-12 text-center text-xl font-black bg-slate-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${pred.home_score !== null ? 'border-blue-500 bg-white shadow-sm' : 'border-slate-100'}`} placeholder="-" value={pred.home_score ?? ""} onChange={(e) => { const val = e.target.value === "" ? null : parseInt(e.target.value); if (val === null || (val >= 0 && val <= 99)) handlePredict(m.id, "home_score", val); }} />
                            </div>
                            
                            <div className="flex flex-col items-center gap-1"><span className="text-xs font-black text-slate-300">VS</span></div>
                            
                            {/* AWAY */}
                            <div className="flex-1 flex flex-col items-center gap-2">
                                <img src={getFlagUrl(m.away_team.id)} className="w-12 h-8 object-cover rounded shadow-sm" />
                                <span className="text-xs font-bold text-center leading-tight text-slate-800 min-h-[2.5em] flex items-center justify-center">{getTeamName(m.away_team.id, m.away_team.name)}</span>
                                <input type="tel" inputMode="numeric" pattern="[0-9]*" className={`w-12 h-12 text-center text-xl font-black bg-slate-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${pred.away_score !== null ? 'border-blue-500 bg-white shadow-sm' : 'border-slate-100'}`} placeholder="-" value={pred.away_score ?? ""} onChange={(e) => { const val = e.target.value === "" ? null : parseInt(e.target.value); if (val === null || (val >= 0 && val <= 99)) handlePredict(m.id, "away_score", val); }} />
                            </div>
                        </div>
                    </div>

                    {/* Footer: Loyalty Warning */}
                    {isChanged && <div className="bg-orange-50 text-orange-700 text-[10px] font-bold text-center py-1.5 border-t border-orange-100">Loyalty Bonus Lost</div>}

                    {/* REVEAL OPPONENT SECTION (Centered) */}
                    <div className="border-t border-slate-100 p-2 bg-slate-50/30 min-h-[40px] flex items-center justify-center">
                        {revealedMatches[m.id] ? (
                            <div className="flex flex-col items-center animate-in zoom-in">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{revealedMatches[m.id].name}</span>
                                <span className="text-sm font-black bg-slate-800 text-white px-3 py-0.5 rounded shadow-sm">{revealedMatches[m.id].home} - {revealedMatches[m.id].away}</span>
                            </div>
                        ) : (
                            <>
                                {peekMatchId === m.id ? (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                        <select 
                                            className="text-[10px] font-bold bg-white border border-blue-300 text-slate-700 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                                            onChange={(e) => {
                                                if (e.target.value && confirm(`${t.confirmReveal || "Reveal pick?"} (1 Token)`)) {
                                                    handleRevealSelection(m.id, e.target.value);
                                                    setPeekMatchId(null);
                                                }
                                            }}
                                            defaultValue=""
                                            autoFocus
                                        >
                                            <option value="" disabled>{t.selectPlayer || "Select Player..."}</option>
                                            {leaderboard.filter((u:any) => u.user_id !== user.id).map((u:any) => (
                                                <option key={u.user_id} value={u.user_id}>{u.display_name}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => setPeekMatchId(null)} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 font-bold hover:bg-slate-300">✕</button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => hasPrediction ? setPeekMatchId(m.id) : alert(t.predictFirst || "Predict first!")}
                                        className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors ${hasPrediction ? 'text-blue-400 hover:text-blue-600' : 'text-slate-300 cursor-not-allowed'}`}
                                    >
                                        <span>👁</span> {t.peekAtRival || "Peek at a rival"}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
             );
          })}
      </div>
      
      <div className="md:hidden text-center mt-6 opacity-30"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Swipe ↔</p></div>
    </div>
  );
}