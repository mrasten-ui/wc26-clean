"use client";
import { getFlagUrl } from "../lib/flags";

interface GroupStageProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  matchesByGroup: any;
  predictions: any;
  // 🔥 FIX: Updated type to match usePrediction hook exactly
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

export default function GroupStage({
  activeTab, matchesByGroup, predictions, handlePredict, 
  user, t, lang, getTeamName
}: GroupStageProps) {
  
  const currentMatches = matchesByGroup[activeTab] || [];
  
  // Calculate standings on the fly for display
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

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
      
      {/* GROUP TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
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
                        {/* Ensure FIFA ranking is visible if available */}
                        {team.fifa_ranking && (
                            <span className="text-[9px] text-slate-400 font-medium">#{team.fifa_ranking}</span>
                        )}
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

      {/* MATCHES LIST */}
      <div className="space-y-3">
        {currentMatches.map((m: any) => {
            const pred = predictions[m.id] || {};
            const isPredicted = pred.home_score !== null && pred.home_score !== undefined;

            return (
                <div key={m.id} className={`bg-white rounded-xl border transition-all ${isPredicted ? 'border-blue-200 shadow-md shadow-blue-50' : 'border-slate-100 shadow-sm'}`}>
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>{new Date(m.kickoff_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span>{m.venue}</span>
                        <span>{new Date(m.kickoff_time).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="p-4 flex items-center justify-between gap-4">
                        {/* HOME TEAM */}
                        <div className="flex-1 flex flex-col items-center gap-2 text-center" onClick={() => handlePredict(m.id, 'home_score', (pred.home_score || 0) + 1)}>
                            <div className="relative">
                                <img src={getFlagUrl(m.home_team.id)} className="w-12 h-8 rounded shadow-md object-cover" alt={m.home_team.name} />
                                <span className="absolute -bottom-2 -right-2 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">#{m.home_team.fifa_ranking || '-'}</span>
                            </div>
                            <span className="font-bold text-sm text-slate-800 leading-tight">{getTeamName(m.home_team.id, m.home_team.name)}</span>
                        </div>

                        {/* SCORE INPUTS */}
                        <div className="flex items-center gap-3">
                            <input 
                                type="tel" 
                                className={`w-12 h-12 text-center font-black text-xl rounded-xl border-2 focus:outline-none focus:ring-4 transition-all ${pred.home_score !== null ? 'bg-blue-50 border-blue-500 text-blue-900 ring-blue-100' : 'bg-slate-50 border-slate-200 text-slate-400 focus:border-blue-400'}`}
                                placeholder="-"
                                value={pred.home_score ?? ''}
                                onChange={(e) => handlePredict(m.id, 'home_score', parseInt(e.target.value) || 0)}
                            />
                            <span className="text-slate-300 font-bold">-</span>
                            <input 
                                type="tel" 
                                className={`w-12 h-12 text-center font-black text-xl rounded-xl border-2 focus:outline-none focus:ring-4 transition-all ${pred.away_score !== null ? 'bg-blue-50 border-blue-500 text-blue-900 ring-blue-100' : 'bg-slate-50 border-slate-200 text-slate-400 focus:border-blue-400'}`}
                                placeholder="-"
                                value={pred.away_score ?? ''}
                                onChange={(e) => handlePredict(m.id, 'away_score', parseInt(e.target.value) || 0)}
                            />
                        </div>

                        {/* AWAY TEAM */}
                        <div className="flex-1 flex flex-col items-center gap-2 text-center" onClick={() => handlePredict(m.id, 'away_score', (pred.away_score || 0) + 1)}>
                            <div className="relative">
                                <img src={getFlagUrl(m.away_team.id)} className="w-12 h-8 rounded shadow-md object-cover" alt={m.away_team.name} />
                                <span className="absolute -bottom-2 -left-2 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">#{m.away_team.fifa_ranking || '-'}</span>
                            </div>
                            <span className="font-bold text-sm text-slate-800 leading-tight">{getTeamName(m.away_team.id, m.away_team.name)}</span>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}