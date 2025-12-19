"use client";
import { useState, useRef, useEffect } from "react";
import { COLORS } from "../lib/constants";
import ProgressRing from "./ProgressRing";
import SubNavigation from "./SubNavigation";

interface HeaderProps {
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeKnockoutRound: string;
  setActiveKnockoutRound: (round: string) => void;
  currentMainTab: "MATCHES" | "GROUPS" | "KNOCKOUT" | "RULES" | "RESULTS";
  // ✅ ADDED: Setter for the main tab
  setCurrentMainTab: (tab: "MATCHES" | "GROUPS" | "KNOCKOUT" | "RULES" | "RESULTS") => void;
  saveStatus: 'idle' | 'saving' | 'saved'; 
  revealCount: number; 
  isGenerating: boolean;
  handleGroupAutoFill: () => void; 
  handleKnockoutAutoFill: () => void;
  handleClearPredictions: () => void; 
  hasPredictions: boolean;
  isTournamentComplete: boolean; 
  handleLogout: () => void;
  lang: 'en' | 'no' | 'us' | 'sc'; 
  setLang: (lang: 'en' | 'no' | 'us' | 'sc') => void;
  t: any; 
  getMainTabStatus: any; 
  getGroupStatus: any; 
  getKnockoutStatus: (stage: string) => 'empty' | 'partial' | 'complete';
  onOpenRules: () => void;
  predictions?: any; 
  totalMatchesCount?: number; 
  matchesCompletedCount?: number;
  showNicknames: boolean; 
  setShowNicknames: (show: boolean) => void;
}

export default function Header({
  user,
  activeTab,
  setActiveTab,
  activeKnockoutRound,
  setActiveKnockoutRound,
  currentMainTab,
  setCurrentMainTab, // <--- Receive this
  saveStatus,
  revealCount,
  isGenerating,
  handleGroupAutoFill,
  handleKnockoutAutoFill,
  handleClearPredictions,
  hasPredictions,
  isTournamentComplete,
  handleLogout,
  lang,
  setLang,
  t,
  getMainTabStatus,
  getGroupStatus,
  getKnockoutStatus,
  onOpenRules,
  predictions,
  showNicknames,
  setShowNicknames
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper for Main Tabs
  const MainTabButton = ({ id, label }: { id: typeof currentMainTab, label: string }) => {
    const isActive = currentMainTab === id;
    return (
      <button
        onClick={() => {
            setCurrentMainTab(id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`
           relative px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all
           ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
        `}
      >
        {label}
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        )}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 shadow-xl transition-all duration-300" style={{ backgroundColor: COLORS.navy }}>
        
        {/* TOP BAR: Logo & User */}
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* LEFT: Logo & Rules */}
            <div className="flex items-center gap-4">
                <div onClick={onOpenRules} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center cursor-pointer transition-colors border border-white/10">
                    <span className="text-lg">🏆</span>
                </div>
                <div className="hidden md:block">
                   <h1 className="text-white font-black text-sm tracking-tighter leading-none">{t.appName}</h1>
                   <p className="text-[9px] text-blue-300 font-bold uppercase tracking-widest">Official Predictor</p>
                </div>
            </div>

            {/* RIGHT: User Profile & Mobile Menu */}
            <div className="flex items-center gap-3">
                 {/* Save Status Indicator */}
                 {saveStatus === 'saving' && <div className="text-[10px] font-bold text-blue-300 animate-pulse uppercase tracking-wider hidden md:block">{t.processing}</div>}
                 
                 {/* User Info */}
                 <div className="flex items-center gap-2 bg-black/20 pl-1 pr-3 py-1 rounded-full border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-200 max-w-[80px] truncate">{user?.full_name || 'Fan'}</span>
                 </div>
                 
                 <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" /><path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" /></svg>
                 </button>
            </div>
        </div>

        {/* MAIN NAVIGATION (Integrated Row) */}
        <div className="border-t border-white/10 bg-black/10 backdrop-blur-sm">
             <div className="max-w-5xl mx-auto flex justify-center md:justify-start">
                  <MainTabButton id="GROUPS" label={t.groupStage || "Groups"} />
                  <MainTabButton id="KNOCKOUT" label={t.knockout || "Knockout"} />
                  <MainTabButton id="RESULTS" label={t.results || "Results"} />
             </div>
        </div>

        {/* SUB NAVIGATION (The specific tabs for Groups/Knockout) */}
        {/* We pass props down. Note: SubNav handles its own rendering logic based on currentMainTab */}
        <SubNavigation 
            currentMainTab={currentMainTab}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeKnockoutRound={activeKnockoutRound}
            setActiveKnockoutRound={setActiveKnockoutRound}
            showTools={true}
            hasPredictions={hasPredictions}
            isGenerating={isGenerating}
            handleSmartAutoFill={handleGroupAutoFill} // Both main tabs utilize this prop name in SubNav
            handleSmartClear={handleClearPredictions}
            getSubTabStatusDot={getGroupStatus}
            getKnockoutDot={getKnockoutStatus}
        />
    </header>
  );
}