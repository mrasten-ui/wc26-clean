"use client";
import { useState, useRef } from "react";
import { format, addDays, subDays, isSameDay, parseISO } from "date-fns";
import { getFlagUrl } from "../lib/flags";

interface MatchCenterProps {
  matches: any[];
  predictions: any;
  t: any;
  onCompare: (matchId: number) => void;
  serverTime?: string;
}

const getMatchHype = (m: any) => {
    if (m.id === 1) return "🔥 Opener";
    if (m.stage === 'FINAL') return "🏆 Final";
    if (m.stage.includes('SEMI')) return "⚔️ Semi";
    const rankDiff = Math.abs(m.home_team.fifa_ranking - m.away_team.fifa_ranking);
    if (rankDiff < 5 && m.home_team.fifa_ranking < 15) return "💎 Top Clash";
    return null;
};

export default function MatchCenter({ matches, predictions, t, onCompare, serverTime }: MatchCenterProps) {
  
  const realToday = serverTime ? new Date(serverTime) : new Date("2026-06-12T12:00:00Z");
  const [viewDate, setViewDate] = useState(realToday);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
      if (!touchStartX.current || !touchEndX.current) return;
      const distance = touchStartX.current - touchEndX.current;
      
      if (distance > 50) setViewDate(curr => addDays(curr, 1));
      else if (distance < -50) setViewDate(curr => subDays(curr, 1));
      
      touchStartX.current = 0;
      touchEndX.current = 0;
  };

  const daysToShow = [
      { date: viewDate, label: isSameDay(viewDate, realToday) ? t.today : format(viewDate, "EEEE"), isActive: true, color: "text-blue-600" },
      { date: addDays(viewDate, 1), label: isSameDay(addDays(viewDate, 1), realToday) ? t.today : format(addDays(viewDate, 1), "EEEE"), color: "text-slate-400" }
  ];

  const getMatchesForDate = (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      return matches.filter(m => m.kickoff_time.startsWith(dateStr)).sort((a,b) => a.kickoff_time.localeCompare(b.kickoff_time));
  };

  const isBettingLocked = true; 

  return (
    <div 
        className="space-y-4 pb-24 min-h-[60vh]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
        <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-slate-200 sticky top-16 z-30 mx-auto max-w-2xl">
            <button onClick={() => setViewDate(subDays(viewDate, 1))} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold transition-colors active:scale-90">←</button>
            
            <div className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.matchCenter || "SCHEDULE"}</span>
                <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-lg">{format(viewDate, "EEE d")}</span>
                    {!isSameDay(viewDate, realToday) && (
                        <button onClick={(e) => { e.stopPropagation(); setViewDate(realToday); }} className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm animate-in fade-in zoom-in">TODAY</button>
                    )}
                </div>
            </div>

            <button onClick={() => setViewDate(addDays(viewDate, 1))} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold transition-colors active:scale-90">→</button>
        </div>

        {isCalendarOpen && (
            <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-200 animate-in slide-in-from-top-2 absolute left-4 right-4 z-40 max-w-sm mx-auto">
                <input type="date" className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-blue-500" value={format(viewDate, "yyyy-MM-dd")} onChange={(e) => { if(e.target.value) { setViewDate(new Date(e.target.value)); setIsCalendarOpen(false); } }} />
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {daysToShow.map((day, idx) => {
                const dayMatches = getMatchesForDate(day.date);
                const visibilityClass = idx === 0 ? "block" : "hidden md:block opacity-80";

                return (
                    <div key={idx} className={`bg-slate-50/50 rounded-2xl p-3 border border-slate-100 ${day.isActive ? 'ring-2 ring-blue-100 bg-blue-50/30' : ''} ${visibilityClass}`}>
                        
                        <div className="text-center mb-4 pt-1">
                            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${day.isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                                {day.label}
                            </span>
                            <div className="text-[10px] font-bold text-slate-400 mt-1">{format(day.date, "MMMM d")}</div>
                        </div>

                        <div className="space-y-2">
                            {dayMatches.length === 0 ? (
                                <div className="text-center py-12 text-slate-300"><div className="text-2xl mb-1">😴</div><div className="text-xs font-bold uppercase tracking-widest">Rest Day</div></div>
                            ) : (
                                dayMatches.map((m) => {
                                    const hype = getMatchHype(m);
                                    const userPred = predictions[m.id];
                                    const isFinished = m.status === 'FINISHED';
                                    const isLive = m.status === 'IN_PLAY';

                                    return (
                                        <div key={m.id} className="bg-white rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden relative group hover:border-blue-200 transition-colors">
                                            <div className="flex justify-between items-center px-2 py-1 bg-slate-50 border-b border-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                                                <span>{format(parseISO(m.kickoff_time), "HH:mm")} • {m.venue.split(',')[0]}</span>
                                                {hype && <span className="text-yellow-600 bg-yellow-100 px-1.5 rounded-sm">{hype}</span>}
                                            </div>
                                            <div className="p-3 flex items-center justify-between">
                                                <div className="flex flex-col items-center w-1/3"><img src={getFlagUrl(m.home_team.id)} className="w-8 h-5 object-cover rounded shadow-sm mb-1" /><span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">{m.home_team.name}</span></div>
                                                <div className="flex flex-col items-center justify-center w-1/3">
                                                    {isFinished || isLive ? (<div className="flex items-center gap-1 text-xl font-black text-slate-900"><span>{m.home_score}</span><span className="text-slate-300 text-sm">-</span><span>{m.away_score}</span></div>) : (<span className="text-xs font-bold text-slate-300 bg-slate-50 px-2 py-1 rounded">VS</span>)}
                                                    {isLive && <span className="text-[9px] font-black text-red-500 animate-pulse mt-0.5">LIVE</span>}
                                                    {isFinished && <span className="text-[9px] font-bold text-slate-400 mt-0.5">FT</span>}
                                                </div>
                                                <div className="flex flex-col items-center w-1/3"><img src={getFlagUrl(m.away_team.id)} className="w-8 h-5 object-cover rounded shadow-sm mb-1" /><span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">{m.away_team.name}</span></div>
                                            </div>
                                            <div className={`px-3 py-1.5 flex justify-between items-center text-[10px] border-t ${isFinished && userPred ? ((userPred.home_score === m.home_score && userPred.away_score === m.away_score) ? 'bg-green-50 border-green-100 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-500') : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                                <div className="flex items-center gap-1"><span className="font-bold">You:</span>{userPred?.home_score !== undefined ? <span className="font-mono font-black">{userPred.home_score}-{userPred.away_score}</span> : <span className="italic opacity-50">-</span>}</div>
                                                {isFinished && <button onClick={() => onCompare(m.id)} className="font-bold hover:text-blue-600 transition-colors flex items-center gap-1">Compare <span>→</span></button>}
                                                {!isFinished && !isLive && <span className="font-bold opacity-60">{isBettingLocked ? "🔒" : "🔓"}</span>}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
        <div className="md:hidden text-center mt-6"><p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Swipe for more</p></div>
    </div>
  );
}