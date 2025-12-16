"use client";
import { useState, useEffect, useRef } from "react";
import { Match, Prediction, LeaderboardEntry, UserData, GlobalPredictions } from "../lib/types";
import { getFlagUrl } from "../lib/flags";
import { COLORS, GROUPS } from "../lib/constants";
import ScoreStepper from "./ScoreStepper";

interface Standing {
  teamId: string;
  points: number;
  gd: number;
  gf: number;
  ga: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
}

interface GroupStageProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  matchesByGroup: Record<string, Match[]>;
  predictions: Record<number, Prediction>;
  handlePredict: (matchId: number, field: string, value: any) => void;
  leaderboard: LeaderboardEntry[];
  allPredictions: GlobalPredictions;
  user: UserData | null;
  revealCount: number;
  handleRevealSelection: (matchId: number) => void;
  revealedMatches: Set<number>;
  t: any;
  lang: string;
  getTeamName: (id: string, def: string) => string;
  standings: Standing[];
}

export default function GroupStage({
  activeTab,
  setActiveTab,
  matchesByGroup,
  predictions,
  handlePredict,
  getTeamName,
  standings
}: GroupStageProps) {
  
  const groupMatches = matchesByGroup[activeTab] || [];
  const sortedMatches = [...groupMatches].sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime());

  const currentGroupIndex = GROUPS.indexOf(activeTab);
  const nextGroup = GROUPS[currentGroupIndex + 1];
  
  const handleNext = () => {
      if (nextGroup) {
          setActiveTab(nextGroup);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
          setActiveTab("SUMMARY");
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  // --- PRECISE SCROLL TRACKING ---
  const [showSticky, setShowSticky] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;

      const rect = tableRef.current.getBoundingClientRect();
      
      // ✅ ADJUSTED THRESHOLD:
      // We set this to 200px. This effectively says: 
      // "When the bottom of the table touches the bottom of the header stack, trigger the banner."
      const headerThreshold = 200; 
      
      const shouldShow = rect.bottom < headerThreshold;
      
      setShowSticky(prev => prev !== shouldShow ? shouldShow : prev);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); 

    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  // --- Sticky Banner Component ---
  const StickyBanner = () => (
      <div 
        className={`fixed left-0 right-0 border-b border-white/10 p-2 shadow-2xl transition-all duration-300 ease-in-out z-20 ${
            showSticky ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
        }`}
        style={{ 
            // ✅ MIDDLE GROUND: 190px should sit perfectly flush under the A-L buttons
            top: '190px', 
            backgroundColor: '#172554' // Deep Navy Blue
        }} 
      >
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar px-2">
              {standings.slice(0, 4).map((team, idx) => {
                  const isQualifying = idx < 2;
                  return (
                      <div key={team.teamId} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${isQualifying ? 'bg-green-500/20 ring-1 ring-green-500/50' : 'bg-white/5'}`}>
                          <span className={`text-[10px] font-black w-3 ${isQualifying ? 'text-green-400' : 'text-slate-500'}`}>{idx + 1}</span>
                          <img src={getFlagUrl(team.teamId)} className="w-5 h-3.5 object-cover rounded shadow-sm" />
                          <span className="text-xs font-bold text-white hidden sm:inline">{getTeamName(team.teamId, team.teamId).substring(0, 3).toUpperCase()}</span>
                          <span className="text-[10px] font-bold text-slate-300 ml-1">{team.points}pt</span>
                      </div>
                  )
              })}
          </div>
      </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-24">
      
      {/* Sticky Banner */}
      <StickyBanner />

      {/* --- GROUP TABLE --- */}
      <div ref={tableRef} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 relative">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
             <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Group {activeTab} Standings</h3>
             <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Top 2 Qualify</span>
          </div>
          <table className="w-full text-xs text-left">
              <thead>
                  <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                      <th className="p-3 text-center w-8">#</th>
                      <th className="p-3">Team</th>
                      <th className="p-3 text-center">PL</th>
                      <th className="p-3 text-center">GD</th>
                      <th className="p-3 text-center font-bold text-slate-700">PTS</th>
                  </tr>
              </thead>
              <tbody>
                  {standings.map((team, index) => {
                      const isQualifying = index < 2;
                      return (
                          <tr key={team.teamId} className={`border-b border-slate-50 last:border-0 ${isQualifying ? 'bg-green-50/30' : ''}`}>
                              <td className={`p-3 text-center font-bold ${isQualifying ? 'text-green-600' : 'text-slate-400'}`}>{index + 1}</td>
                              <td className="p-3 flex items-center gap-3">
                                  <img src={getFlagUrl(team.teamId)} className="w-6 h-4 object-cover rounded shadow-sm ring-1 ring-black/5" />
                                  <span className="font-bold text-slate-700">{getTeamName(team.teamId, team.teamId)}</span>
                                  {isQualifying && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-auto" />}
                              </td>
                              <td className="p-3 text-center text-slate-500">{team.played}</td>
                              <td className={`p-3 text-center font-bold ${team.gd > 0 ? 'text-green-600' : (team.gd < 0 ? 'text-red-500' : 'text-slate-400')}`}>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                              <td className="p-3 text-center font-black text-slate-800 text-sm">{team.points}</td>
                          </tr>
                      )
                  })}
                  {standings.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">No matches predicted yet.</td></tr>
                  )}
              </tbody>
          </table>
      </div>

      {/* --- MATCH CARDS --- */}
      <div className="flex flex-col gap-4">
        {sortedMatches.map((match) => {
          const homeTeamName = getTeamName(match.home_team_id || '', match.home_team?.name || 'Home');
          const awayTeamName = getTeamName(match.away_team_id || '', match.away_team?.name || 'Away');
          const pred = predictions[match.id] || { home_score: null, away_score: null };
          
          const isLocked = match.status === 'FINISHED' || match.status === 'IN_PLAY';
          const isPredicted = pred.home_score !== null && pred.away_score !== null && pred.home_score !== undefined && pred.away_score !== undefined;

          // 0-0 LOGIC
          const handleScoreChange = (side: 'home_score' | 'away_score', val: number) => {
             const rivalSide = side === 'home_score' ? 'away_score' : 'home_score';
             const rivalScore = pred[rivalSide];
             if (rivalScore === null || rivalScore === undefined) {
                 handlePredict(match.id, rivalSide, 0);
             }
             handlePredict(match.id, side, val);
          };

          const matchDate = new Date(match.kickoff_time).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
          const matchTime = new Date(match.kickoff_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div 
              key={match.id} 
              className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${
                  isPredicted 
                  ? 'border-green-400 ring-1 ring-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]' 
                  : 'border-slate-200'
              }`}
            >
               <div className="bg-slate-50/80 px-4 py-2 flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100 tracking-wider">
                  <span>{matchDate} <span className="text-slate-300 mx-1">|</span> {matchTime}</span>
                  <span className="text-slate-400">{match.venue}</span>
               </div>

               <div className="flex items-center justify-between p-4">
                  <div className="flex-1 flex flex-col items-center gap-2">
                     <img src={getFlagUrl(match.home_team_id || '')} className="w-12 h-8 object-cover rounded shadow-sm ring-1 ring-black/5" />
                     <span className={`text-xs font-bold text-center leading-tight ${isPredicted ? 'text-green-900' : 'text-slate-700'}`}>{homeTeamName}</span>
                  </div>

                  <div className="flex items-center gap-4">
                      <ScoreStepper 
                        value={pred.home_score} 
                        onChange={(val) => handleScoreChange('home_score', val)} 
                        disabled={isLocked} 
                      />
                      <span className="text-slate-300 font-black text-lg mt-2">-</span>
                      <ScoreStepper 
                        value={pred.away_score} 
                        onChange={(val) => handleScoreChange('away_score', val)} 
                        disabled={isLocked} 
                      />
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-2">
                     <img src={getFlagUrl(match.away_team_id || '')} className="w-12 h-8 object-cover rounded shadow-sm ring-1 ring-black/5" />
                     <span className={`text-xs font-bold text-center leading-tight ${isPredicted ? 'text-green-900' : 'text-slate-700'}`}>{awayTeamName}</span>
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      <div className="pt-6 border-t border-slate-200/50">
          <button 
             onClick={handleNext}
             className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-95"
          >
              <span>{nextGroup ? `Next: Group ${nextGroup}` : "Go to Summary"}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
          </button>
      </div>
    </div>
  );
}