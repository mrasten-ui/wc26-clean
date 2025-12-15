"use client";
import { GROUPS, KNOCKOUT_STAGES, STAGE_COLORS } from "../lib/constants";

interface SubNavProps {
    currentMainTab: string;
    activeTab: string;
    setActiveTab: (t: string) => void;
    activeKnockoutRound: string;
    setActiveKnockoutRound: (t: string) => void;
    showTools: boolean;
    hasPredictions: boolean;
    isGenerating: boolean;
    handleSmartAutoFill: () => void;
    handleSmartClear: () => void;
    getSubTabStatusDot: (id: string) => string;
    getKnockoutDot: (id: string) => string;
}

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.338 13.07a.75.75 0 01.629.926l-.54 1.891c-.25.874-.936 1.56-1.81 1.81l-1.891.54a.75.75 0 010-1.442l1.891-.54c.437-.125.78-.468.905-.905l.54-1.891a.75.75 0 01.926-.63z" clipRule="evenodd" />
    <path d="M16.5 17.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H17.25a.75.75 0 01-.75-.75v-.008zM15 19.5a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H15.75a.75.75 0 01-.75-.75v-.008z" />
  </svg>
);

const getRoundShortName = (stage: string) => {
    if (stage.includes("32")) return "R32";
    if (stage.includes("16")) return "R16";
    if (stage.includes("QUARTER")) return "QF";
    if (stage.includes("SEMI")) return "SF";
    if (stage.includes("THIRD")) return "3RD";
    if (stage.includes("FINAL")) return "FIN";
    return stage;
};

export default function SubNavigation({ 
    currentMainTab, activeTab, setActiveTab, activeKnockoutRound, setActiveKnockoutRound,
    showTools, hasPredictions, isGenerating, handleSmartAutoFill, handleSmartClear,
    getSubTabStatusDot, getKnockoutDot 
}: SubNavProps) {

    // 1. GROUP STAGE SUB-NAV
    if (currentMainTab === "GROUPS" && activeTab !== "SUMMARY" && activeTab !== "RULES" && activeTab !== "RESULTS" && activeTab !== "MATCHES") {
        return (
            <div className="flex items-center justify-center p-2 gap-2 border-t border-white/5" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                {showTools && (
                    <div className="flex gap-1 mr-2 border-r border-white/10 pr-2">
                        {hasPredictions && <button onClick={handleSmartClear} className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-transparent text-slate-400 border-2 border-red-500 hover:bg-red-500/20 transition-all shadow-sm" title="Clear All Picks"><TrashIcon /></button>}
                        <button 
                            onClick={handleSmartAutoFill} 
                            disabled={isGenerating} 
                            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-yellow-300 to-yellow-500 text-slate-900 shadow-[0_0_15px_rgba(234,179,8,0.6)] hover:scale-105 active:scale-95 transition-all border border-yellow-200" 
                            title="The Rasten Helping Hand"
                        >
                            {isGenerating ? <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : <SparklesIcon />}
                        </button>
                    </div>
                )}
                {GROUPS.map((group) => (
                    <button 
                        key={group} 
                        onClick={() => setActiveTab(group)} 
                        className={`flex-shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center text-sm font-black transition-all relative
                        ${activeTab === group ? "bg-white text-slate-900 scale-105" : "bg-white/10 text-slate-300 hover:bg-white/20"}
                        `}
                        style={activeTab === group ? { border: `2px solid ${STAGE_COLORS[group] || '#ccc'}`, boxShadow: `0 0 12px ${STAGE_COLORS[group]}60` } : {}}
                    >
                        <span className="relative z-10">{group}</span>
                        <span className={`w-1.5 h-1.5 rounded-full mt-0.5 relative z-10 ${getSubTabStatusDot(group)}`} />
                    </button>
                ))}
                <div className="w-px h-6 bg-white/20 mx-1" />
                <button onClick={() => setActiveTab("SUMMARY")} className={`flex-shrink-0 px-3 h-10 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === "SUMMARY" ? "bg-blue-500 text-white shadow-lg" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}>Overview</button>
            </div>
        );
    }

    // 2. KNOCKOUT SUB-NAV
    if (currentMainTab === "KNOCKOUT" && activeTab !== "RULES" && activeTab !== "RESULTS" && activeTab !== "MATCHES") {
        return (
            <div className="overflow-x-auto flex items-center p-2 gap-2 no-scrollbar border-t border-white/5 md:justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                {showTools && (
                    <div className="flex gap-1 mr-2 border-r border-white/10 pr-2">
                        {hasPredictions && <button onClick={handleSmartClear} className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-transparent text-slate-400 border-2 border-red-500 hover:bg-red-500/20 transition-all shadow-sm" title="Clear All Picks"><TrashIcon /></button>}
                        <button 
                            onClick={handleSmartAutoFill} 
                            disabled={isGenerating} 
                            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-yellow-300 to-yellow-500 text-slate-900 shadow-[0_0_15px_rgba(234,179,8,0.6)] hover:scale-105 active:scale-95 transition-all border border-yellow-200" 
                            title="The Rasten Helping Hand"
                        >
                            {isGenerating ? <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : <SparklesIcon />}
                        </button>
                    </div>
                )}
                {KNOCKOUT_STAGES.map((stage) => (
                    <button key={stage} onClick={() => setActiveKnockoutRound(stage)} className={`flex-shrink-0 px-4 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-black transition-all relative ${activeKnockoutRound === stage ? "bg-white text-slate-900 scale-105 shadow-lg" : "bg-white/10 text-white hover:bg-white/20"}`}>
                        <span className="relative z-10">{getRoundShortName(stage)}</span>
                        {activeKnockoutRound === stage && <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: STAGE_COLORS[stage] || '#ccc', boxShadow: `0 0 8px ${STAGE_COLORS[stage]}` }} />}
                        
                        {/* ✅ DOT LOGIC */}
                        <span className={`w-1.5 h-1.5 rounded-full mt-0.5 relative z-10 ${
                            getKnockoutDot(stage) === 'complete' ? "bg-green-500" : 
                            (getKnockoutDot(stage) === 'partial' ? "bg-orange-400" : "bg-slate-600")
                        }`} />
                    </button>
                ))}
                <div className="w-px h-6 bg-white/20 mx-1" />
                <button onClick={() => setActiveKnockoutRound("TREE")} className={`flex-shrink-0 px-3 h-10 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-wider transition-all relative ${activeKnockoutRound === "TREE" ? "bg-purple-500 text-white shadow-lg" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}>
                    <span className="relative z-10">🌳 Tree</span>
                    {activeKnockoutRound === "TREE" && <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: STAGE_COLORS["TREE"], boxShadow: `0 0 8px ${STAGE_COLORS["TREE"]}` }} />}
                </button>
            </div>
        );
    }

    return null;
}