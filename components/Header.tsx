"use client";
import { COLORS } from "../lib/constants";
import SubNavigation from "./SubNavigation";

interface HeaderProps {
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeKnockoutRound: string;
  setActiveKnockoutRound: (round: string) => void;
  currentMainTab: "GROUPS" | "KNOCKOUT" | "MATCHES" | "RESULTS" | "RULES"; // ✅ Updated Order
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
  saveStatus,
  isGenerating,
  handleGroupAutoFill,
  handleKnockoutAutoFill,
  handleClearPredictions,
  hasPredictions,
  handleLogout,
  t,
  getGroupStatus,
  getKnockoutStatus,
  onOpenRules,
}: HeaderProps) {

  return (
    <header className="sticky top-0 z-40 shadow-xl transition-all duration-300" style={{ backgroundColor: COLORS.navy }}>
        
        {/* TOP BAR: Logo (Centered) & User (Right) */}
        <div className="relative max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            
            {/* LEFT: Rules / Menu */}
            <div className="flex items-center gap-2 z-10">
                <button onClick={onOpenRules} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors border border-white/10">
                    <span className="text-xl">🏆</span>
                </button>
            </div>

            {/* CENTER: Logo & Title (Absolute Positioned for True Center) */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center">
                 <img 
                    src="/icon-192.png" 
                    alt="Logo" 
                    className="w-8 h-8 object-contain mb-1 drop-shadow-md" 
                    onError={(e) => e.currentTarget.style.display = 'none'}
                 />
                 <h1 className="text-white font-black text-[10px] tracking-widest leading-none uppercase drop-shadow-md">
                    {t.appName}
                 </h1>
            </div>

            {/* RIGHT: User Profile */}
            <div className="flex items-center gap-3 z-10">
                 {saveStatus === 'saving' && (
                     <div className="hidden md:block text-[10px] font-bold text-blue-300 animate-pulse uppercase tracking-wider">
                        {t.processing}
                     </div>
                 )}
                 
                 <div className="flex items-center gap-2 bg-black/20 pl-1 pr-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner ring-1 ring-white/10">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <span className="hidden md:block text-xs font-bold text-slate-200 max-w-[80px] truncate">
                        {user?.full_name || 'Fan'}
                    </span>
                 </div>
                 
                 <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" /><path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" /></svg>
                 </button>
            </div>
        </div>

        {/* SUB NAVIGATION (Lives inside header for seamless look) */}
        <SubNavigation 
            currentMainTab={currentMainTab}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeKnockoutRound={activeKnockoutRound}
            setActiveKnockoutRound={setActiveKnockoutRound}
            showTools={true}
            hasPredictions={hasPredictions}
            isGenerating={isGenerating}
            handleSmartAutoFill={handleGroupAutoFill}
            handleSmartClear={handleClearPredictions}
            getSubTabStatusDot={getGroupStatus}
            getKnockoutDot={getKnockoutStatus}
        />
    </header>
  );
}