import { useState } from "react";
import { COLORS } from "../lib/constants";
import { TeamData } from "../lib/types";
import { getFlagUrl } from "../lib/flags";

interface AutoFillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedTeamIds: string[]) => void;
  allTeams: TeamData[];
  lang: string;
  t: any;
}

export default function AutoFillModal({ isOpen, onClose, onConfirm, allTeams, lang, t }: AutoFillModalProps) {
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeams(prev => {
      if (prev.includes(teamId)) return prev.filter(id => id !== teamId);
      if (prev.length >= 3) return [...prev.slice(1), teamId];
      return [...prev, teamId];
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedTeams);
    setSelectedTeams([]);
    onClose();
  };

  // ✅ FIXED: Safety check for missing rankings
  const sortedTeams = [...allTeams].sort((a, b) => (a.fifa_ranking || 100) - (b.fifa_ranking || 100));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity"
      style={{ backgroundColor: `${COLORS.navy}dd` }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <span className="text-2xl mb-2 inline-block">✨</span>
          <h2 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">{t.smartAutoFill || "Smart Auto-Fill"}</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">{t.selectFavorites || "Select up to 3 favorites."}</p>

          <div className="grid grid-cols-4 gap-3 mb-6 max-h-60 overflow-y-auto p-2 no-scrollbar">
            {sortedTeams.map((team) => {
              const isSelected = selectedTeams.includes(team.id);
              return (
                <button
                  key={team.id}
                  onClick={() => handleSelectTeam(team.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isSelected ? "bg-blue-50 ring-2 ring-blue-500 scale-105" : "hover:bg-slate-50 opacity-70 hover:opacity-100"}`}
                >
                  <img src={getFlagUrl(team.id)} alt={team.name} className="w-8 h-8 rounded-full object-cover shadow-sm" />
                  <span className={`text-[9px] font-bold truncate w-full ${isSelected ? "text-blue-700" : "text-slate-400"}`}>{team.id}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
             <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">{t.cancel || "Cancel"}</button>
             <button onClick={handleConfirm} className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg active:scale-95">{t.generate || "Generate"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}