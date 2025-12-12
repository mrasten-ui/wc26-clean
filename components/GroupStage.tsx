"use client";
import { Match, Prediction, LeaderboardEntry, GlobalPredictions } from "../lib/types";
import { COLORS } from "../lib/constants"; // Ensures we use the correct #154284
import { getFlagUrl } from "../lib/flags";
import { calculateGroupStandings } from "../lib/calculator";
import { useState } from "react";

interface GroupStageProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  matchesByGroup: Record<string, Match[]>;
  predictions: Record<number, Prediction>;
  handlePredict: (matchId: number, field: "home_score" | "away_score", value: any) => void;
  leaderboard: LeaderboardEntry[];
  allPredictions: GlobalPredictions;
  user: any;
  revealCount: number;
  handleRevealSelection: (matchId: number, userId: string) => void;
  revealedMatches: Record<number, { name: string, home: number | null, away: number | null }>;
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
  user,
  revealCount,
  handleRevealSelection,
  revealedMatches,
  t,
  lang,
  getTeamName
}: GroupStageProps) {
  
  const currentGroupMatches = matchesByGroup[activeTab] || [];
  
  // @ts-ignore
  const standings = calculateGroupStandings(currentGroupMatches, predictions);

  // LOGIC: First click sets 0-0. Min value is 0.
  const updateScore = (matchId: number, team: 'home' | 'away', delta: number) => {
    const pred = predictions[matchId] || {};
    const currentHome = pred.home_score;
    const currentAway = pred.away_score;

    // 1. If prediction doesn't exist yet (is null/undefined), ANY click sets it to 0-0
    if (currentHome === null || currentHome === undefined || currentAway === null || currentAway === undefined) {
       handlePredict(matchId, 'home_score', 0);
       handlePredict(matchId, 'away_score', 0);
       return;
    }

    // 2. Otherwise, adjust the specific score (Minimum 0)
    if (team === 'home') {
        const newVal = Math.max(0, currentHome + delta);
        handlePredict(matchId, 'home_score', newVal);
    } else {
        const newVal = Math.max(0, currentAway + delta);
        handlePredict(matchId, 'away_score', newVal);
    }
  };

  // Date formatting utility
  const formatMatchTime = (dateStr: string, isLocal: boolean) => {
    const d = new Date(dateStr);
    
    if (isLocal) {
        // User's Local Browser Timezone (Time only)
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        // Original Kickoff Time (Date + Time)
        return d.toLocaleDateString(lang === 'no' ? 'no-NO' : 'en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            timeZoneName: 'short' 
        });
    }
  };


  return (
    // MAX WIDTH: Constrained to 4xl for professional look
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* 1. LIVE STANDINGS (Tidy & Clean) */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.group} {activeTab} {t.results}</h3>
            <span className="text-[9px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full uppercase">Top 2 Qualify</span>
        </div>
        <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
                <tr>
                    <th className="p-2 pl-4 text-left w-8">#</th>
                    <th className="p-2 text-left">Team</th>
                    <th className="p-2 text-center w-8">GD</th>
                    <th className="p-2 text-center w-8">Pts</th>
                </tr>
            </thead>
            <tbody>
                {standings.map((team: any, idx: number) => (
                    <tr key={team.id} className={`border-b last:border-0 ${idx < 2 ? 'bg-green-50/40' : ''}`}>
                        <td className={`p-2 pl-4 font-mono ${idx < 2 ? 'font-bold text-green-700' : 'text-slate-400'}`}>{idx + 1}</td>
                        <td className="p-2 flex items-center gap-3 font-bold text-slate-700">
                            <img src={getFlagUrl(team.id)} className="w-5 h-3.5 object-cover rounded shadow-sm" />
                            {getTeamName(team.id, team.name)}
                        </td>
                        <td className="p-2 text-center font-mono text-slate-400 text-[10px]">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                        <td className="p-2 text-center font-black text-slate-900">{team.points}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* 2. MATCH CARDS */}
      <div className="space-y-4">
        {currentGroupMatches.map((m) => {
          const pred = predictions[m.id] || {};
          const isActive = pred.home_score !== null && pred.home_score !== undefined;
          
          return (
            <div key={m.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                
                {/* MATCH HEADER: Local Time | Venue | Official Time (Uses exact Navy color) */}
                <div className="text-white px-4 py-1.5 grid grid-cols-3 items-center text-[10px] font-bold uppercase tracking-widest" style={{ backgroundColor: COLORS.navy }}>
                    
                    {/* LEFT: User's Local Kickoff Time */}
                    <span className="text-left text-yellow-400/80">
                        {formatMatchTime(m.kickoff_time.toString(), true)}
                    </span>
                    
                    {/* CENTER: Venue Name */}
                    <span className="text-center opacity-70">
                        {m.venue}
                    </span>
                    
                    {/* RIGHT: Original Kickoff Time */}
                    <span className="text-right opacity-50">
                        {formatMatchTime(m.kickoff_time.toString(), false)}
                    </span>
                </div>

                {/* Match Body */}
                <div className="p-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    
                    {/* HOME */}
                    <div className="flex flex-col items-center gap-2">
                        <img src={getFlagUrl(m.home_team_id!)} className="w-10 h-7 object-cover rounded shadow-sm" />
                        <span className="text-[11px] font-bold text-center text-slate-700 leading-tight w-24">{getTeamName(m.home_team_id!, m.home_team?.name || '')}</span>
                    </div>

                    {/* INPUTS (Steppers) */}
                    <div className="flex items-center gap-1.5">
                        
                        {/* Home Stepper */}
                        <div className="flex flex-col items-center gap-1">
                            <button onClick={() => updateScore(m.id, 'home', 1)} className="w-8 h-6 flex items-center justify-center bg-slate-50 text-slate-400 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">▲</button>
                            <div className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 font-black text-xl shadow-inner transition-all ${isActive ? 'border-blue-500 bg-white text-slate-900' : 'border-slate-100 bg-slate-50 text-slate-300'}`}>
                                {pred.home_score ?? '-'}
                            </div>
                            <button onClick={() => updateScore(m.id, 'home', -1)} className="w-8 h-6 flex items-center justify-center bg-slate-50 text-slate-400 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">▼</button>
                        </div>
                        
                        {/* Divider */}
                        <div className="flex flex-col items-center justify-center px-1">
                            <span className="block w-1 h-1 bg-slate-300 rounded-full mb-1"></span>
                            <span className="block w-1 h-1 bg-slate-300 rounded-full"></span>
                        </div>

                        {/* Away Stepper */}
                        <div className="flex flex-col items-center gap-1">
                            <button onClick={() => updateScore(m.id, 'away', 1)} className="w-8 h-6 flex items-center justify-center bg-slate-50 text-slate-400 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">▲</button>
                            <div className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 font-black text-xl shadow-inner transition-all ${isActive ? 'border-blue-500 bg-white text-slate-900' : 'border-slate-100 bg-slate-50 text-slate-300'}`}>
                                {pred.away_score ?? '-'}
                            </div>
                            <button onClick={() => updateScore(m.id, 'away', -1)} className="w-8 h-6 flex items-center justify-center bg-slate-50 text-slate-400 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">▼</button>
                        </div>
                    </div>

                    {/* AWAY */}
                    <div className="flex flex-col items-center gap-2">
                        <img src={getFlagUrl(m.away_team_id!)} className="w-10 h-7 object-cover rounded shadow-sm" />
                        <span className="text-[11px] font-bold text-center text-slate-700 leading-tight w-24">{getTeamName(m.away_team_id!, m.away_team?.name || '')}</span>
                    </div>

                </div>

                {/* Footer: Reveal Rival */}
                <div className="bg-slate-50 p-2 border-t border-slate-100 flex justify-center">
                     <button 
                        onClick={() => alert(t.peekAtRival)}
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                     >
                        <span>👁️</span> {t.peekAtRival}
                     </button>
                </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}