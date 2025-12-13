"use client";
import { useState, useEffect } from "react";
import { getFlagUrl } from "../lib/flags";

interface GroupStageProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  matchesByGroup: any;
  predictions: any;
  handlePredict: (matchId: number, field: "home_score" | "away_score" | "winner_id", value: any) => void;
  leaderboard: any[];
  allPredictions: any;
  user: any;
  revealCount: number;
  handleRevealSelection: (matchId: number, rivalId: string) => void;
  revealedMatches: any;
  t: any;
  lang: string;
  getTeamName: (id: string, def: string) => string;
}

// --- COMPONENT: ROBUST NEON STEPPER ---
const ScoreStepper = ({ 
    value, 
    onChange 
}: { 
    value: number | null | undefined, 
    onChange: (val: number) => void
}) => {
    
    // Direct State Logic
    const handleUp = (e: React.MouseEvent) => {
        e.preventDefault(); 
        e.stopPropagation();
        const current = (value === null || value === undefined) ? -1 : value;
        onChange(current + 1);
    };

    const handleDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const current = (value === null || value === undefined) ? 1 : value;
        if (current > 0) onChange(current - 1);
        else onChange(0);
    };

    const isActive = value !== null && value !== undefined;
    
    // Design: Flex Column (No Absolute Positioning bugs)
    const containerClass = isActive 
        ? "bg-[#0f2d5a] ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] text-white" 
        : "bg-slate-100 border border-slate-200 text-slate-300 hover:border-slate-300";
        
    const numberClass = isActive ? "scale-110 font-black text-cyan-50" : "font-medium";
    const btnClass = isActive ? "text-cyan-200 hover:bg-white/10" : "text-slate-400 hover:bg-slate-200";

    return (
        <div className={`flex flex-col w-12 sm:w-14 h-24 rounded-2xl transition-all duration-300 select-none z-10 relative overflow-hidden ${containerClass}`}>
            
            {/* UP BUTTON */}
            <button 
                type="button" 
                onClick={handleUp}
                className={`flex-1 w-full flex items-center justify-center transition-colors active:scale-95 touch-manipulation cursor-pointer ${btnClass}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
                </svg>
            </button>

            {/* SCORE DISPLAY */}
            <div className={`h-8 flex items-center justify-center text-3xl leading-none transition-transform duration-300 z-10 pointer-events-none ${numberClass}`}>
                {value ?? '-'}
            </div>

            {/* DOWN BUTTON */}
            <button 
                type="button"
                onClick={handleDown}
                className={`flex-1 w-full flex items-center justify-center transition-colors active:scale-95 touch-manipulation cursor-pointer ${btnClass}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};


export default function GroupStage({
  activeTab, matchesByGroup, predictions, handlePredict, 
  user, t, lang, getTeamName
}: GroupStageProps) {
  
  const currentMatches = matchesByGroup[activeTab] || [];
  const [showMiniTable, setShowMiniTable] = useState(false);
  
  // --- 1. Calculate Standings ---
  const standings = currentMatches.reduce((acc: any, m: any) => {
      const home = m.home_team;
      const away = m.away_team;
      if (!home || !away) return acc;
      
      if (!acc[home.id]) acc[home.id] = { ...home, p: 0, gd: 0, pts: 0 };
      if (!acc[away.id]) acc[away.id] = { ...away, p: 0, gd: 0, pts: 0 };

      const pred = predictions[m.id];
      if (pred && pred.home_score !== null && pred.away_score !== null) {
          acc[home.id].p += 1;
          acc[away.id].p += 1;
          const gd = pred.home_score - pred.away_score;
          acc[home.id].gd += gd;
          acc[away.id].gd -= gd;
          
          if (pred.home_score > pred.away_score) acc[home.id].pts += 3;
          else if (pred.away_score > pred.home_score) acc[away.id].pts += 3;
          else { acc[home.id].pts += 1; acc[away.id].pts += 1; }
      }
      return acc;
  }, {});

  const sortedStandings = Object.values(standings).sort((a: any, b: any) => b.pts - a.pts || b.gd - a.gd);

  // --- 2. Smart Predict Logic ---
  const smartPredict = (matchId: number, field: "home_score" | "away_score", val: number, currentPred: any) => {
      handlePredict(matchId, field, val);
      // Init other score to 0 if null
      const otherField = field === "home_score" ? "away_score" : "home_score";
      if (currentPred[otherField] == null) {
          handlePredict(matchId, otherField, 0);
      }
  };

  // --- 3. Scroll Detection for Mini Table ---
  useEffect(() => {
    const handleScroll = () => {
        // Show mini table after scrolling past 200px
        if (window.scrollY > 200) {
            setShowMiniTable(true);
        } else {
            setShowMiniTable(false);
        }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-500 relative">
      
      {/* --- FLOATING MINI TABLE (Sticky) --- */}
      {/* FIX: Z-Index 40 (Below Header z-50), Top Adjusted to slide OUT from header */}
      <div className={`fixed top-[134px] left-0 right-0 z-40 transition-all duration-500 ease-in-out transform ${showMiniTable ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-xl mx-auto px-4">
             <div className="bg-[#154284] shadow-2xl border-t border-white/10 text-white rounded-b-2xl px-4 py-3 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar ring-1 ring-white/10">
                {sortedStandings.map((team: any, i: number) => (
                    <div key={team.id} className={`flex flex-col items-center justify-center min-w-[3rem] gap-1 ${i < 2 ? 'opacity-100' : 'opacity-50'}`}>
                        <div className="flex items-center gap-1">
                            <span className={`text-[10px] font-black ${i < 2 ? 'text-green-400' : 'text-slate-400'}`}>{i+1}</span>
                            <img src={getFlagUrl(team.id)} alt={team.id} className="w-5 h-3.5 rounded shadow-sm" />
                        </div>
                        <span className="text-xs font-bold leading-none">{team.pts}</span>
                    </div>
                ))}
             </div>
        </div>
      </div>

      {/* --- MAIN GROUP TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative z-10">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
             <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Group {activeTab} Table</h2>
             <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Top 2 Qualify</span>
        </div>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-xs text-slate-400 border-b border-slate-50">
              <th className="px-4 py-2 font-medium w-8">#</th>
              <th className="px-2 py-2 font-medium">Team</th>
              <th className="px-2 py-2 font-medium text-center w-10">GD</th>
              <th className="px-4 py-2 font-medium text-right w-10">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedStandings.map((team: any, i: number) => (
              <tr key={team.id} className={i < 2 ? "bg-green-50/30" : ""}>
                <td className={`px-4 py-3 font-bold ${i < 2 ? "text-green-700" : "text-slate-400"}`}>{i + 1}</td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-3">
                    <img src={getFlagUrl(team.id)} alt={team.name} className="w-6 h-4 rounded shadow-sm object-cover" />
                    <div className="flex flex-col leading-none">
                        <span className="font-bold text-slate-800">{getTeamName(team.id, team.name)}</span>
                        {/* Only show rank if it exists */}
                        {team.fifa_ranking ? (
                            <span className="text-[9px] text-slate-400 font-medium">#{team.fifa_ranking}</span>
                        ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-3 text-center text-slate-500 text-xs font-mono">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                <td className="px-4 py-3 text-right font-black text-slate-900">{team.pts}</td>
              </tr>
            ))}
            {sortedStandings.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400 text-xs italic">No data available for Group {activeTab}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* --- MATCHES LIST --- */}
      <div className="space-y-4 pb-20">
        {currentMatches.map((m: any) => {
            const pred = predictions[m.id] || {};
            const hasScore = pred.home_score != null;
            
            return (
                <div key={m.id} className={`bg-white rounded-2xl border transition-all duration-300 ${hasScore ? 'border-blue-200 shadow-lg shadow-blue-50/50' : 'border-slate-100 shadow-sm hover:shadow-md'}`}>
                    
                    {/* Header */}
                    <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 rounded-t-2xl flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>{new Date(m.kickoff_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span>{m.venue}</span>
                        <span>{new Date(m.kickoff_time).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Match Body */}
                    <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                        
                        {/* HOME TEAM */}
                        <div className="flex-1 flex flex-row sm:flex-col items-center gap-4 sm:gap-3 w-full sm:w-auto justify-end sm:justify-center text-right sm:text-center">
                            <div className="flex flex-col">
                                <span className="font-black text-base text-slate-800 leading-tight order-2 sm:order-2">{getTeamName(m.home_team.id, m.home_team.name)}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block order-3">Home</span>
                            </div>
                            <div className="relative order-1 sm:order-1 shrink-0">
                                <img src={getFlagUrl(m.home_team.id)} className="w-12 h-8 sm:w-16 sm:h-10 rounded shadow-md object-cover ring-1 ring-slate-100" alt={m.home_team.name} />
                                {m.home_team.fifa_ranking && <span className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">#{m.home_team.fifa_ranking}</span>}
                            </div>
                        </div>

                        {/* THE NEON OBELISKS */}
                        <div className="flex items-center gap-3 sm:gap-6 shrink-0 z-10">
                            {/* Updated to simple handlePredict to avoid conflicts */}
                            <ScoreStepper 
                                value={pred.home_score} 
                                onChange={(val) => smartPredict(m.id, 'home_score', val, pred)}
                            />
                            
                            {/* VS Badge */}
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-slate-200 font-black text-xl">VS</span>
                            </div>
                            
                            <ScoreStepper 
                                value={pred.away_score} 
                                onChange={(val) => smartPredict(m.id, 'away_score', val, pred)}
                            />
                        </div>

                        {/* AWAY TEAM */}
                        <div className="flex-1 flex flex-row sm:flex-col items-center gap-4 sm:gap-3 w-full sm:w-auto justify-start sm:justify-center text-left sm:text-center">
                             <div className="relative shrink-0">
                                <img src={getFlagUrl(m.away_team.id)} className="w-12 h-8 sm:w-16 sm:h-10 rounded shadow-md object-cover ring-1 ring-slate-100" alt={m.away_team.name} />
                                {m.away_team.fifa_ranking && <span className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">#{m.away_team.fifa_ranking}</span>}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-base text-slate-800 leading-tight">{getTeamName(m.away_team.id, m.away_team.name)}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block">Away</span>
                            </div>
                        </div>

                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}