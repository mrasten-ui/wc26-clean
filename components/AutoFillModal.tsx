"use client";
import { useState, useEffect } from 'react'; // useEffect added here
import { TeamData } from '../lib/types';
import { getFlagUrl } from '../lib/flags';
import { COLORS } from '../lib/constants';

interface AutoFillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedTeams: string[]) => void;
    allTeams: TeamData[];
    lang: string;
    t: any;
}

export default function AutoFillModal({ isOpen, onClose, onConfirm, allTeams, lang, t }: AutoFillModalProps) {
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    
    // 1. SCROLL LOCK FIX: Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset'; // Clean up on unmount
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSelectTeam = (teamId: string) => {
        setSelectedTeams(prev => {
            if (prev.includes(teamId)) {
                return prev.filter(id => id !== teamId);
            }
            if (prev.length < 3) {
                return [...prev, teamId];
            }
            return prev; // Max 3 teams allowed
        });
    };

    const handleConfirm = () => {
        onConfirm(selectedTeams);
        setSelectedTeams([]);
        onClose();
    };
    
    // Sort teams by FIFA ranking (ascending)
    const sortedTeams = allTeams.sort((a, b) => a.fifa_ranking - b.fifa_ranking);

    return (
        // BACKGROUND OVERLAY
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity" 
            style={{ backgroundColor: `${COLORS.navy}dd` }} // Use the correct navy with more opacity
            onClick={onClose}
        >
            <div 
                // 2. SIZE FIX: Changed from max-w-lg to max-w-sm
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <span className="text-2xl mb-2 inline-block">✨</span>
                    <h2 className="text-xl font-black text-slate-900 mb-1">
                        {t.helpingHandTitle || "THE RASTEN HELPING HAND"}
                    </h2>
                    <p className="text-slate-500 mb-5 text-sm">
                        {t.helpingHandText || "Select up to 3 teams. The Helping Hand will give these teams a significant advantage in the simulation!"}
                    </p>

                    {/* TEAM SELECTION GRID: Scrolling enabled */}
                    <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-scroll pr-3 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
                        {sortedTeams.map(team => (
                            <button
                                key={team.id}
                                onClick={() => handleSelectTeam(team.id)}
                                className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all shadow-sm ${
                                    selectedTeams.includes(team.id)
                                        ? 'border-yellow-500 bg-yellow-50/50 scale-105 shadow-md'
                                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                                }`}
                                disabled={!selectedTeams.includes(team.id) && selectedTeams.length >= 3}
                            >
                                <img src={getFlagUrl(team.id)} alt={team.id} className="w-8 h-6 object-cover rounded shadow-sm mb-1" />
                                <span className="text-[10px] font-bold text-slate-700 leading-tight">{team.id}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* SIMULATION BUTTON */}
                <div className="px-6 pb-6">
                    <button
                        onClick={handleConfirm}
                        style={{ backgroundColor: COLORS.navy }}
                        className="w-full py-3 text-white font-black rounded-xl uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedTeams.length === 0}
                    >
                        {t.runSimulation || "Run Simulation"} ✨
                    </button>
                    {selectedTeams.length > 0 && (
                        <p className="mt-2 text-[10px] text-center text-slate-500">
                            {t.selected || "Selected:"} {selectedTeams.map(id => id).join(', ')}
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}