"use client";
import { Match, Prediction, LeaderboardEntry, UserData, GlobalPredictions } from "../lib/types";
import { getFlagUrl } from "../lib/flags";
import { COLORS, GROUPS } from "../lib/constants";
import ScoreStepper from "./ScoreStepper";

interface GroupStageProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  matchesByGroup: Record<string, Match[]>;
  predictions: Record<number, Prediction>;
  // ✅ FIXED: Value type relaxed to 'any'
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
}

export default function GroupStage({
  activeTab,
  setActiveTab,
  matchesByGroup,
  predictions,
  handlePredict,
  getTeamName
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

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col gap-4">
        {sortedMatches.map((match) => {
          const homeTeamName = getTeamName(match.home_team_id || '', match.home_team?.name || 'Home');
          const awayTeamName = getTeamName(match.away_team_id || '', match.away_team?.name || 'Away');
          const pred = predictions[match.id] || { home_score: null, away_score: null };
          
          // ✅ FIXED: Now valid because MatchStatus includes IN_PLAY
          const isLocked = match.status === 'FINISHED' || match.status === 'IN_PLAY';
          const matchDate = new Date(match.kickoff_time).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
          const matchTime = new Date(match.kickoff_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={match.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-slate-50/80 px-4 py-2 flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100 tracking-wider">
                  <span>{matchDate} <span className="text-slate-300 mx-1">|</span> {matchTime}</span>
                  <span className="text-slate-400">{match.venue}</span>
               </div>
               <div className="flex items-center justify-between p-4">
                  <div className="flex-1 flex flex-col items-center gap-2">
                     <img src={getFlagUrl(match.home_team_id || '')} className="w-10 h-7 object-cover rounded shadow-sm ring-1 ring-black/5" />
                     <span className="text-xs font-bold text-slate-700 text-center leading-tight">{homeTeamName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <ScoreStepper 
                        value={pred.home_score} 
                        onChange={(val) => handlePredict(match.id, 'home_score', val)} 
                        disabled={isLocked} 
                      />
                      <span className="text-slate-300 font-black text-xs">-</span>
                      <ScoreStepper 
                        value={pred.away_score} 
                        onChange={(val) => handlePredict(match.id, 'away_score', val)} 
                        disabled={isLocked} 
                      />
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                     <img src={getFlagUrl(match.away_team_id || '')} className="w-10 h-7 object-cover rounded shadow-sm ring-1 ring-black/5" />
                     <span className="text-xs font-bold text-slate-700 text-center leading-tight">{awayTeamName}</span>
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