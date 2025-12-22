"use client";
import { COLORS } from "../lib/constants";

interface HeaderProps {
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeKnockoutRound: string;
  setActiveKnockoutRound: (round: string) => void;
  currentMainTab: "GROUPS" | "KNOCKOUT" | "MATCHES" | "RESULTS" | "RULES";
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
  saveStatus,
  handleLogout,
  t,
  onOpenRules,
}: HeaderProps) {

  return (
    <header className="sticky top-0 z-40 shadow-xl transition-all duration-300" style={{ backgroundColor: COLORS.navy }}>
        
        {/* TOP BAR */}
        <div className="relative max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            
            {/* LEFT: Flags / Lang (Optional placeholder if you want flags back here, otherwise Spacer) */}
            <div className="flex gap-2 z-10">
                 {/* You can re-add language buttons here if needed, currently keeping spacer to match design */}
                 <div className="w-10"></div>
            </div>

            {/* CENTER: Logo + Text */}
            <button 
                onClick={onOpenRules}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-4 group"
            >
                 <img 
                    src="/icon-192.png" 
                    alt="Logo" 
                    className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform" 
                    onError={(e) => e.currentTarget.style.display = 'none'}
                 />
                 <div className="text-left hidden xs:block">
                     <h1 className="text-white font-black text-sm tracking-widest leading-none uppercase drop-shadow-md whitespace-nowrap">
                        {t.appName}
                     </h1>
                     <p className="text-[8px] text-blue-300 font-bold uppercase tracking-[0.2em] opacity-80 group-hover:text-yellow-400 transition-colors">
                        Official Predictor
                     </p>
                 </div>
            </button>

            {/* RIGHT: User Profile / Hamburger */}
            <div className="flex items-center gap-3 z-10">
                 {saveStatus === 'saving' && (
                     <div className="hidden md:block text-[10px] font-bold text-blue-300 animate-pulse uppercase tracking-wider">
                        {t.processing}
                     </div>
                 )}
                 
                 {/* User Badge */}
                 <div className="hidden md:flex items-center gap-2 bg-black/20 pl-1 pr-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner ring-1 ring-white/10">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-200 max-w-[80px] truncate">
                        {user?.full_name || 'Fan'}
                    </span>
                 </div>
                 
                 {/* Logout / Menu Icon */}
                 <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                 </button>
            </div>
        </div>
    </header>
  );
}