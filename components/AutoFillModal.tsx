"use client";
import { useState } from "react";

export default function AutoFillModal({ isOpen, onClose, onConfirm, allTeams, lang, t, teamNamesNo, isKnockout }: any) {
  const [favorites, setFavorites] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleFavorite = (id: string) => {
      setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-yellow-400">
        <div className="bg-yellow-400 p-4 text-center">
            <h2 className="text-xl font-black text-yellow-900 uppercase tracking-tighter">
                {isKnockout ? "Predict The Bracket" : "The Helping Hand"}
            </h2>
            <p className="text-xs font-bold text-yellow-800/80">Select your favorites, we do the rest.</p>
        </div>
        
        <div className="p-4 max-h-[50vh] overflow-y-auto grid grid-cols-2 gap-2">
            {allTeams.map((team: any) => (
                <button 
                    key={team.id}
                    onClick={() => toggleFavorite(team.id)}
                    className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${favorites.includes(team.id) ? 'border-yellow-400 bg-yellow-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                    <span className="text-lg">{favorites.includes(team.id) ? '⭐' : '⚪'}</span>
                    <span className="font-bold text-sm text-slate-700">{team.name}</span>
                </button>
            ))}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
            <button 
                onClick={() => onConfirm(favorites)} 
                className="flex-1 py-3 rounded-xl font-black text-yellow-900 bg-yellow-400 hover:bg-yellow-300 shadow-lg transition-transform active:scale-95"
            >
                GENERATE
            </button>
        </div>
      </div>
    </div>
  );
}