"use client";
import { useState } from "react";
import { getFlagUrl } from "../lib/flags";

export default function Leaderboard({ leaderboard, t, matches, allPredictions, user, lang }: any) {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Sort leaderboard: Total Points DESC, then Display Name ASC
  const sorted = [...leaderboard].sort((a, b) => b.total_points - a.total_points || a.display_name.localeCompare(b.display_name));

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-20">
        {/* Top 3 Podium (Optional visual flair) */}
        {sorted.length >= 3 && (
            <div className="flex items-end justify-center gap-4 mb-8 pt-4">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-sm font-black text-slate-500 mb-1">2</div>
                    <div className="bg-slate-100 p-3 rounded-t-xl w-20 text-center border-t-4 border-slate-300 shadow-sm">
                        <p className="text-[10px] font-bold truncate w-full">{sorted[1].display_name}</p>
                        <p className="text-lg font-black text-slate-800">{sorted[1].total_points}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center z-10">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center text-lg font-black text-yellow-600 mb-1 shadow-md">1</div>
                    <div className="bg-yellow-50 p-4 rounded-t-xl w-24 text-center border-t-4 border-yellow-400 shadow-lg scale-110">
                        <p className="text-xs font-bold truncate w-full">{sorted[0].display_name}</p>
                        <p className="text-xl font-black text-slate-900">{sorted[0].total_points}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center text-sm font-black text-orange-600 mb-1">3</div>
                    <div className="bg-orange-50 p-3 rounded-t-xl w-20 text-center border-t-4 border-orange-300 shadow-sm">
                        <p className="text-[10px] font-bold truncate w-full">{sorted[2].display_name}</p>
                        <p className="text-lg font-black text-slate-800">{sorted[2].total_points}</p>
                    </div>
                </div>
            </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                        <th className="p-3 text-center w-12">#</th>
                        <th className="p-3">Player</th>
                        <th className="p-3 text-center">G</th>
                        <th className="p-3 text-center">KO</th>
                        <th className="p-3 text-right">Pts</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((p, idx) => {
                        const isMe = p.user_id === user?.id;
                        return (
                            <tr key={p.user_id} 
                                onClick={() => setExpandedUser(expandedUser === p.user_id ? null : p.user_id)}
                                className={`border-b border-slate-100 last:border-0 transition-colors cursor-pointer ${isMe ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                            >
                                <td className="p-3 text-center font-bold text-slate-400 text-sm">{idx + 1}</td>
                                <td className="p-3">
                                    <p className={`font-bold text-sm ${isMe ? 'text-blue-600' : 'text-slate-800'}`}>{p.display_name} {isMe && "(You)"}</p>
                                </td>
                                <td className="p-3 text-center text-xs font-mono text-slate-500">{p.group_points}</td>
                                <td className="p-3 text-center text-xs font-mono text-slate-500">{p.ko_points}</td>
                                <td className="p-3 text-right font-black text-slate-900 text-lg">{p.total_points}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
  );
}