"use client";
import { UserData, Prediction } from "../lib/types";

interface HeaderProps {
  user: UserData | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentMainTab: string;
  activeKnockoutRound: string;
  setActiveKnockoutRound: (round: string) => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  revealCount: number;
  isGenerating: boolean;
  handleGroupAutoFill: () => void;
  handleKnockoutAutoFill: () => void;
  handleClearPredictions: () => void;
  hasPredictions: boolean;
  isTournamentComplete: boolean;
  handleLogout: () => void;
  lang: string;
  setLang: (lang: 'en' | 'no' | 'us' | 'sc') => void;
  t: any;
  getMainTabStatus: (tab: "GROUPS" | "KNOCKOUT") => "empty" | "partial" | "complete";
  getGroupStatus: (gid: string) => "empty" | "partial" | "complete";
  getKnockoutStatus: (stage: string) => "empty" | "partial" | "complete";
  onOpenRules: () => void;
  predictions: Record<number, Prediction>;
  totalMatchesCount: number;
  matchesCompletedCount: number;
  showNicknames: boolean;
  setShowNicknames: (show: boolean) => void;
}

export default function Header({
  user, activeTab, setActiveTab, currentMainTab,
  saveStatus, revealCount, handleGroupAutoFill, handleKnockoutAutoFill,
  handleClearPredictions, hasPredictions, handleLogout, lang, setLang, t,
  getMainTabStatus, getGroupStatus, onOpenRules, showNicknames, setShowNicknames
}: HeaderProps) {

  return (
    <header className="bg-slate-900 text-white shadow-2xl relative z-50">
      {/* --- TOP BAR (Logo & User) --- */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
         {/* ... (Logo code remains the same) ... */}
         <div className="flex items-center gap-3">
             <div className="flex flex-col items-start">
                 <h1 className="text-xl font-black tracking-tighter uppercase italic text-white leading-none">
                     The Rasten Cup <span className="text-blue-400">'26</span>
                 </h1>
             </div>
         </div>

         {/* Right Side Tools */}
         <div className="flex items-center gap-3">
             <button onClick={() => setLang(lang === 'no' ? 'en' : 'no')} className="text-xs font-bold bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-700 transition-colors">
                 {lang === 'no' ? '🇳🇴 NO' : '🇬🇧 EN'}
             </button>
             <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                 {t.logout || "Log out"}
             </button>
         </div>
      </div>

      {/* --- MAIN NAVIGATION --- */}
      <div className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-xl mx-auto flex items-center justify-between px-2 h-12">
            {/* ... (Main Tabs code remains the same) ... */}
            <button 
                onClick={() => setActiveTab('A')}
                className={`flex-1 flex items-center justify-center gap-2 h-full text-[10px] font-black uppercase tracking-widest transition-all ${currentMainTab === 'GROUPS' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
                {t.groups || "GROUPS"}
                <span className={`w-1.5 h-1.5 rounded-full ${getMainTabStatus('GROUPS') === 'complete' ? 'bg-green-500' : (getMainTabStatus('GROUPS') === 'partial' ? 'bg-orange-500' : 'bg-slate-700')}`} />
            </button>
             <button 
                onClick={() => setActiveTab('KNOCKOUT')}
                className={`flex-1 flex items-center justify-center gap-2 h-full text-[10px] font-black uppercase tracking-widest transition-all ${currentMainTab === 'KNOCKOUT' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
                {t.knockout || "KNOCKOUT"}
            </button>
             <button 
                onClick={() => setActiveTab('MATCHES')}
                className={`flex-1 flex items-center justify-center gap-2 h-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'MATCHES' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
                {t.matches || "MATCHES"}
            </button>
             <button 
                onClick={() => setActiveTab('RESULTS')}
                className={`flex-1 flex items-center justify-center gap-2 h-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'RESULTS' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
                {t.leaderboard || "TABLE"}
            </button>
        </div>
      </div>

      {/* --- SUB NAVIGATION (GROUPS) --- */}
      {currentMainTab === "GROUPS" && activeTab !== "MATCHES" && activeTab !== "RESULTS" && (
        <div className="bg-[#0f172a] border-b border-white/10 py-2 overflow-x-auto no-scrollbar">
           <div className="max-w-2xl mx-auto flex items-center justify-between px-4 gap-2 min-w-max">
               
               {/* CLEAR BUTTON */}
               {hasPredictions && (
                 <button 
                    onClick={handleClearPredictions}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                    title="Clear All"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                     <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                   </svg>
                 </button>
               )}

               {/* ✅ AUTO-FILL BUTTON (RESTYLED) */}
               <button 
                  onClick={handleGroupAutoFill}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-yellow-500 text-yellow-400 bg-transparent hover:bg-yellow-500/10 transition-all shadow-[0_0_10px_rgba(234,179,8,0.1)] active:scale-95"
                  title="Auto-Fill"
               >
                 <span className="text-sm">✨</span>
               </button>

               <div className="w-px h-6 bg-slate-700 mx-1" />

               {/* GROUP BUTTONS A-L */}
               {['A','B','C','D','E','F','G','H','I','J','K','L'].map(g => {
                   const status = getGroupStatus(g);
                   const isActive = activeTab === g;
                   return (
                       <button
                          key={g}
                          onClick={() => setActiveTab(g)}
                          className={`
                            h-8 w-8 rounded-lg text-[10px] font-black flex flex-col items-center justify-center transition-all relative
                            ${isActive 
                                ? 'bg-white text-slate-900 shadow-lg scale-110 z-10' 
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}
                          `}
                       >
                           {g}
                           {status === 'complete' && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-green-500" />}
                           {status === 'partial' && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-400" />}
                       </button>
                   )
               })}

               <div className="w-px h-6 bg-slate-700 mx-1" />

               {/* ✅ OVERVIEW BUTTON */}
               <button 
                  onClick={() => setActiveTab('SUMMARY')}
                  className={`
                    px-3 h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                    ${activeTab === 'SUMMARY' 
                        ? 'bg-slate-700 text-white shadow-inner border border-slate-600' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}
                  `}
               >
                  Overview
               </button>
           </div>
        </div>
      )}
    </header>
  );
}