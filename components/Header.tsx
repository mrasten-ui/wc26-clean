"use client";
import { useState, useRef, useEffect } from "react";
import { COLORS, GROUPS, KNOCKOUT_STAGES, STAGE_COLORS } from "../lib/constants";
import ProgressRing from "./ProgressRing";

interface HeaderProps {
  user: any; activeTab: string; setActiveTab: (tab: string) => void;
  activeKnockoutRound: string; setActiveKnockoutRound: (round: string) => void;
  currentMainTab: "MATCHES" | "GROUPS" | "KNOCKOUT" | "RULES" | "RESULTS";
  saveStatus: 'idle' | 'saving' | 'saved'; 
  revealCount: number; isGenerating: boolean;
  handleGroupAutoFill: () => void; handleKnockoutAutoFill: () => void;
  handleClearPredictions: () => void; hasPredictions: boolean;
  isTournamentComplete: boolean; handleLogout: () => void;
  lang: 'en' | 'no' | 'us' | 'sc'; setLang: (lang: 'en' | 'no' | 'us' | 'sc') => void;
  t: any; getMainTabStatus: any; getGroupStatus: any; getKnockoutStatus: (stage: string) => 'empty' | 'partial' | 'complete';
  onOpenRules: () => void;
  predictions?: any; totalMatchesCount?: number; matchesCompletedCount?: number;
  showNicknames: boolean; setShowNicknames: (show: boolean) => void;
}

const getRoundShortName = (stage: string) => {
    if (stage.includes("32")) return "R32";
    if (stage.includes("16")) return "R16";
    if (stage.includes("QUARTER")) return "QF";
    if (stage.includes("SEMI")) return "SF";
    if (stage.includes("THIRD")) return "3RD";
    if (stage.includes("FINAL")) return "FIN";
    return stage;
};

// ... (Keep your existing Flag/Icon components here: ScottishFlag, NorwayFlag, etc.) ...
// For brevity, I am assuming you keep the small icon components you already have.

// [PASTE THE ICON COMPONENTS HERE IF YOU DELETED THEM]
// If you need me to paste them again, let me know. 
// Assuming they are still in your file or you can copy them from previous responses.

export default function Header({
  user, activeTab, setActiveTab, activeKnockoutRound, setActiveKnockoutRound, 
  currentMainTab, saveStatus, revealCount, isGenerating, 
  handleGroupAutoFill, handleKnockoutAutoFill, handleClearPredictions, hasPredictions,
  isTournamentComplete, handleLogout, lang, setLang, t, getMainTabStatus, getGroupStatus, getKnockoutStatus, onOpenRules,
  predictions = {}, totalMatchesCount = 104, matchesCompletedCount = 0,
  showNicknames, setShowNicknames
}: HeaderProps) {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [visibleSaveStatus, setVisibleSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Fix stuck "Saved" button
  useEffect(() => {
    setVisibleSaveStatus(saveStatus);
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => {
        setVisibleSaveStatus('idle');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // ... (Keep existing derivation logic like predictionCount, groupStatus, etc.) ...
  const predictionCount = Object.values(predictions).filter((p: any) => {
      if (p.home_score !== null && p.away_score !== null) return true;
      if (p.winner_id) return true;
      return false;
  }).length;
  
  const groupStatus = getMainTabStatus("GROUPS");
  const knockoutStatus = getMainTabStatus("KNOCKOUT");
  const getStatusDot = (status: string) => status === 'complete' ? <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" /> : (status === 'partial' ? <span className="w-2 h-2 rounded-full bg-orange-400" /> : <span className="w-2 h-2 rounded-full bg-slate-600" />);
  const getSubTabStatusDot = (groupId: string) => getGroupStatus(groupId) === 'complete' ? "bg-green-500" : (getGroupStatus(groupId) === 'partial' ? "bg-orange-400" : "bg-slate-300");
  const getKnockoutDot = (stage: string) => getKnockoutStatus(stage) === 'complete' ? "bg-green-500" : (getKnockoutStatus(stage) === 'partial' ? "bg-orange-400" : "bg-slate-300");

  const isBracketMode = activeTab === "BRACKET";
  const showTools = currentMainTab === "GROUPS" || (isBracketMode && currentMainTab === "KNOCKOUT");

  return (
    <header className="sticky top-0 z-50 text-white shadow-xl transition-all duration-300" style={{ backgroundColor: COLORS.navy }}>
      
      {/* ... (Keep your existing Menu / Logo / Tabs JSX here) ... */}
      {/* I am focusing on the Toast notification change below */}

      {/* TABS (Existing code) */}
      <div className="flex w-full text-xs font-bold uppercase tracking-widest border-t border-white/10" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
         <button onClick={() => setActiveTab("A")} className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors relative ${currentMainTab === 'GROUPS' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>{t.groupStage || "GROUPS"} {getStatusDot(groupStatus)} {currentMainTab === 'GROUPS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />}</button>
         <button onClick={() => setActiveTab("BRACKET")} className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors relative ${currentMainTab === 'KNOCKOUT' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>{t.knockout || "KNOCKOUT"} {getStatusDot(knockoutStatus)} {currentMainTab === 'KNOCKOUT' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />}</button>
         <button onClick={() => setActiveTab("MATCHES")} className={`flex-1 py-4 flex items-center justify-center transition-colors relative ${currentMainTab === 'MATCHES' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Matches {currentMainTab === 'MATCHES' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />}</button>
         <button onClick={() => setActiveTab("RESULTS")} className={`flex-1 py-4 flex items-center justify-center transition-colors relative ${activeTab === 'RESULTS' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>{t.results || "THE TABLE"} {activeTab === 'RESULTS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />}</button>
      </div>

      {/* ... (Keep existing Sub-menus for Groups/Knockout) ... */}

      {/* ✅ NEW: SAVING TOAST NOTIFICATION (Bottom Right) */}
      {visibleSaveStatus !== 'idle' && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
           <div className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-sm border backdrop-blur-md ${
               visibleSaveStatus === 'saving' 
                 ? 'bg-slate-900/90 text-white border-slate-700' 
                 : 'bg-green-500 text-white border-green-400'
           }`}>
               {visibleSaveStatus === 'saving' ? (
                   <>
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     <span>Saving...</span>
                   </>
               ) : (
                   <>
                     <span>✓</span>
                     <span>Saved</span>
                   </>
               )}
           </div>
        </div>
      )}
    </header>
  );
}