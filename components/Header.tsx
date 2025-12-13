"use client";
import { useState, useRef } from "react";
import { COLORS, GROUPS, KNOCKOUT_STAGES, STAGE_COLORS } from "../lib/constants";
import ProgressRing from "./ProgressRing";

// Define the HeaderProps interface clearly
interface HeaderProps {
    user: any; 
    activeTab: string; 
    setActiveTab: (tab: string) => void;
    activeKnockoutRound: string; 
    setActiveKnockoutRound: (round: string) => void;
    currentMainTab: "MATCHES" | "GROUPS" | "KNOCKOUT" | "RULES" | "RESULTS";
    
    // Corrected type definition
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
    
    // Final fix: The missing prop 'onOpenRules'
    onOpenRules: () => void;
    
    predictions?: any; 
    totalMatchesCount?: number; 
    matchesCompletedCount?: number;
    showNicknames: boolean; 
    setShowNicknames: (show: boolean) => void;
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

const VIDEO_PATHS: Record<string, string> = {
    en: "/videos/intro_en.mp4",
    no: "/videos/intro_no.mp4",
    us: "/videos/intro_us.mp4",
    sc: "/videos/intro_sc.mp4"
};

const ScottishFlag = ({ className = "w-5 h-3" }: { className?: string }) => (
  <svg viewBox="0 0 5 3" className={`${className} shadow-sm rounded-sm`}>
    <rect width="5" height="3" fill="#0065BD"/>
    <path d="M0,0 L5,3 M5,0 L0,3" stroke="white" strokeWidth="0.6"/>
  </svg>
);
const NorwayFlag = ({ className = "w-5 h-3" }: { className?: string }) => (
  <svg viewBox="0 0 22 16" className={`${className} shadow-sm rounded-sm`}>
    <rect width="22" height="16" fill="#BA0C2F"/>
    <path d="M0,8 H22 M8,0 V16" stroke="white" strokeWidth="4"/>
    <path d="M0,8 H22 M8,0 V16" stroke="#00205B" strokeWidth="2"/>
  </svg>
);
const USFlag = ({ className = "w-5 h-3" }: { className?: string }) => (
  <svg viewBox="0 0 19 10" className={`${className} shadow-sm rounded-sm`}>
    <rect width="19" height="10" fill="#B22234"/>
    <path d="M0,1 H19 M0,3 H19 M0,5 H19 M0,7 H19 M0,9 H19" stroke="white" strokeWidth="1"/>
    <rect width="7.6" height="5.4" fill="#3C3B6E"/>
    <path d="M1,1 h5 M1,3 h5 M1,5 h5" stroke="white" strokeWidth="0.5" strokeDasharray="0.1 0.9" />
  </svg>
);
const UKFlag = ({ className = "w-5 h-3" }: { className?: string }) => (
  <svg viewBox="0 0 60 30" className={`${className} shadow-sm rounded-sm`}>
    <rect width="60" height="30" fill="#012169"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="white" strokeWidth="6"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2"/>
    <path d="M30,0 v30 M0,15 h60" stroke="white" strokeWidth="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const WandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
  </svg>
);

// CRITICAL FIX: Ensure this is the default export
export default function Header({
  user, activeTab, setActiveTab, activeKnockoutRound, setActiveKnockoutRound, 
  currentMainTab, saveStatus, revealCount, isGenerating, 
  handleGroupAutoFill, handleKnockoutAutoFill, handleClearPredictions, hasPredictions,
  isTournamentComplete, handleLogout, lang, setLang, t, getMainTabStatus, getGroupStatus, getKnockoutStatus, onOpenRules,
  predictions = {}, totalMatchesCount = 104, matchesCompletedCount = 0,
  showNicknames, setShowNicknames
}: HeaderProps) {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [hasPlayedVideo, setHasPlayedVideo] = useState<Record<string, boolean>>({}); 
  const videoRef = useRef<HTMLVideoElement>(null);

  const predictionCount = Object.values(predictions).filter((p: any) => {
      if (p.home_score !== null && p.away_score !== null) return true;
      if (p.winner_id) return true;
      return false;
  }).length;
  const progressTotal = totalMatchesCount;

  const groupStatus = getMainTabStatus("GROUPS");
  const knockoutStatus = getMainTabStatus("KNOCKOUT");
  const getStatusDot = (status: string) => status === 'complete' ? <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" /> : (status === 'partial' ? <span className="w-2 h-2 rounded-full bg-orange-400" /> : <span className="w-2 h-2 rounded-full bg-slate-600" />);
  const getSubTabStatusDot = (groupId: string) => getGroupStatus(groupId) === 'complete' ? "bg-green-500" : (getGroupStatus(groupId) === 'partial' ? "bg-orange-400" : "bg-slate-300");
  const getKnockoutDot = (stage: string) => getKnockoutStatus(stage) === 'complete' ? "bg-green-500" : (getKnockoutStatus(stage) === 'partial' ? "bg-orange-400" : "bg-slate-300");

  const isBracketMode = activeTab === "BRACKET";
  const showTools = currentMainTab === "GROUPS" || (isBracketMode && currentMainTab === "KNOCKOUT");

  const handleSmartAutoFill = () => isBracketMode ? handleKnockoutAutoFill() : handleGroupAutoFill();
  const handleSmartClear = () => {
      if(confirm(lang === 'no' ? "Er du sikker? Dette sletter alle tips i denne delen." : "Are you sure? This will delete all predictions in this section.")) {
          handleClearPredictions();
      }
  };
  
  const handleLangSelect = (newLang: 'en' | 'no' | 'us' | 'sc') => {
      setLang(newLang);
      localStorage.setItem("wc26_lang", newLang);

      if (!hasPlayedVideo[newLang]) {
          setShowVideo(true);
          setHasPlayedVideo(prev => ({ ...prev, [newLang]: true }));
          setTimeout(() => {
              if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play().catch(e => console.log("Autoplay blocked:", e));
              }
          }, 100);
      }
  };

  const triggerVideo = () => {
      setShowVideo(true);
      if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(e => console.log("Autoplay blocked:", e));
      }
  };

  return (
    <header className="sticky top-0 z-50 text-white shadow-xl transition-all duration-300" style={{ backgroundColor: COLORS.navy }}>
      
      {showVideo && (
        <div 
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setShowVideo(false)}
        >
            <div 
                className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/10 animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <video 
                    ref={videoRef}
                    src={VIDEO_PATHS[lang] || VIDEO_PATHS['en']} 
                    className="w-full h-full object-contain bg-black" 
                    autoPlay 
                    playsInline
                    muted 
                    onEnded={() => setShowVideo(false)}
                />
                <button 
                    onClick={() => setShowVideo(false)}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-sm border border-white/20"
                >
                    ✕
                </button>
            </div>
        </div>
      )}

      {isMenuOpen && <div className="fixed inset-0 z-20 bg-black/20 backdrop-blur-[2px]" onClick={() => setIsMenuOpen(false)} />}

      <div className="px-4 py-4 flex items-center justify-between relative h-[88px]">
        <div className="flex flex-col gap-2 z-20">
           <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-lg backdrop-blur-sm border border-white/5">
                <button onClick={() => handleLangSelect('en')} className={`p-1.5 rounded transition-all ${lang === 'en' ? 'bg-white shadow-sm scale-110' : 'opacity-40 hover:opacity-100 grayscale hover:grayscale-0'}`} title="English"><UKFlag className="w-6 h-4" /></button>
                <button onClick={() => handleLangSelect('no')} className={`p-1.5 rounded transition-all ${lang === 'no' ? 'bg-white shadow-sm scale-110' : 'opacity-40 hover:opacity-100 grayscale hover:grayscale-0'}`} title="Norsk"><NorwayFlag className="w-6 h-4" /></button>
                <button onClick={() => handleLangSelect('us')} className={`p-1.5 rounded transition-all ${lang === 'us' ? 'bg-white shadow-sm scale-110' : 'opacity-40 hover:opacity-100 grayscale hover:grayscale-0'}`} title="American"><USFlag className="w-6 h-4" /></button>
                <button onClick={() => handleLangSelect('sc')} className={`p-1.5 rounded transition-all ${lang === 'sc' ? 'bg-white shadow-sm scale-110' : 'opacity-40 hover:opacity-100 grayscale hover:grayscale-0'}`} title="Scottish"><ScottishFlag className="w-6 h-4" /></button>
           </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
           <button onClick={triggerVideo} className="pointer-events-auto active:scale-95 transition-transform duration-100 flex flex-col items-center group">
               <img src="/logo_r.png" alt="The Rasten Cup '26 Logo" className="h-16 w-auto object-contain drop-shadow-md mt-1 group-hover:brightness-110" />
               <h1 className="text-lg font-black tracking-tighter uppercase leading-none text-center text-blue-100/90 drop-shadow-sm mt-0.5">The Rasten Cup '26</h1>
           </button>
        </div>
        <div className="w-20 flex justify-end z-20">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 -mr-2 text-white hover:bg-white/10 rounded-full transition-colors relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-slate-800 border-t border-slate-700 shadow-2xl p-6 animate-in slide-in-from-top-2 duration-200 flex flex-col gap-6 text-sm z-30">
           <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <div><p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Player Profile</p><p className="font-bold text-xl text-white">{user?.displayName || "Guest"}</p><p className="text-[10px] text-slate-400 mt-1">{predictionCount}/{progressTotal} Predictions</p></div>
              <div className="flex items-center gap-4"><div className="flex flex-col items-center gap-1"><ProgressRing radius={20} stroke={3} progress={predictionCount} total={progressTotal} /><span className="text-[9px] text-slate-400">Picks</span></div><div className="flex flex-col items-center gap-1 border-l border-slate-600 pl-4"><ProgressRing radius={20} stroke={3} progress={matchesCompletedCount} total={progressTotal} /><span className="text-[9px] text-slate-400">Live</span></div></div>
           </div>
           <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700"><span className="font-bold text-slate-300 text-xs">{t.menuNicknames}</span><button onClick={() => setShowNicknames(!showNicknames)} className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${showNicknames ? 'bg-green-500 justify-end' : 'bg-slate-600 justify-start'}`}><div className="w-4 h-4 bg-white rounded-full shadow-sm" /></button></div>
           <button onClick={() => { setIsMenuOpen(false); onOpenRules(); }} className="w-full py-4 text-white font-bold bg-slate-700 hover:bg-slate-600 rounded-xl transition-all flex items-center justify-center gap-2"><span>📖</span> {t.rules}</button>
           <button onClick={handleLogout} className="w-full py-4 text-red-400 font-bold bg-slate-900/50 hover:bg-red-900/20 rounded-xl border border-red-900/30 transition-all active:scale-95">{t.logout || "Log Out"}</button>
        </div>
      )}

      {/* TABS */}
      <div className="flex w-full text-xs font-bold uppercase tracking-widest border-t border-white/10" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
        
        <button onClick={() => setActiveTab("A")} className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors relative ${currentMainTab === 'GROUPS' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>{t.groupStage || "GROUPS"} {getStatusDot(groupStatus)} {currentMainTab === 'GROUPS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />}</button>
        
        <button onClick={() => setActiveTab("BRACKET")} className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors relative ${currentMainTab === 'KNOCKOUT' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>{t.knockout || "KNOCKOUT"} {getStatusDot(knockoutStatus)} {currentMainTab === 'KNOCKOUT' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />}</button>
        
        <button onClick={() => setActiveTab("MATCHES")} className={`flex-1 py-4 flex items-center justify-center transition-colors relative ${currentMainTab === 'MATCHES' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
            Matches {currentMainTab === 'MATCHES' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />}
        </button>

        <button onClick={() => setActiveTab("RESULTS")} className={`flex-1 py-4 flex items-center justify-center transition-colors relative ${activeTab === 'RESULTS' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>{t.results || "THE TABLE"} {activeTab === 'RESULTS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />}</button>
      </div>

      {currentMainTab === "GROUPS" && activeTab !== "SUMMARY" && activeTab !== "RULES" && activeTab !== "RESULTS" && activeTab !== "MATCHES" && (
        <div className="overflow-x-auto flex items-center p-2 gap-2 no-scrollbar border-t border-white/5 md:justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          {showTools && (
             <div className="flex gap-1 mr-2 border-r border-white/10 pr-2">
                 {hasPredictions && <button onClick={handleSmartClear} className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-transparent text-slate-400 border-2 border-red-500 hover:bg-red-500/20 transition-all shadow-sm" title="Clear All Picks"><TrashIcon /></button>}
                 <button onClick={handleSmartAutoFill} disabled={isGenerating} className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-transparent text-yellow-400 border-2 border-yellow-400 hover:bg-yellow-400/20 transition-all shadow-sm" title="The Rasten Helping Hand">{isGenerating ? <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" /> : <WandIcon />}</button>
             </div>
          )}
          {GROUPS.map((group) => (
            <button key={group} onClick={() => setActiveTab(group)} className={`flex-shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center text-sm font-black transition-all relative overflow-hidden ${activeTab === group ? "bg-white text-slate-900 scale-105 shadow-lg" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}>
              <span className="relative z-10">{group}</span>
              {activeTab === group && <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: STAGE_COLORS[group] || '#ccc', boxShadow: `0 0 8px ${STAGE_COLORS[group]}` }} />}
              <span className={`w-1.5 h-1.5 rounded-full mt-0.5 relative z-10 ${getSubTabStatusDot(group)}`} />
            </button>
          ))}
          <div className="w-px h-6 bg-white/20 mx-1" />
          <button onClick={() => setActiveTab("SUMMARY")} className={`flex-shrink-0 px-3 h-10 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === "SUMMARY" ? "bg-blue-500 text-white shadow-lg" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}>Overview</button>
        </div>
      )}

      {currentMainTab === "KNOCKOUT" && activeTab !== "RULES" && activeTab !== "RESULTS" && activeTab !== "MATCHES" && (
        <div className="overflow-x-auto flex items-center p-2 gap-2 no-scrollbar border-t border-white/5 md:justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          {showTools && (
             <div className="flex gap-1 mr-2 border-r border-white/10 pr-2">
                 {hasPredictions && <button onClick={handleSmartClear} className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-transparent text-slate-400 border-2 border-red-500 hover:bg-red-500/20 transition-all shadow-sm" title="Clear All Picks"><TrashIcon /></button>}
                 <button onClick={handleSmartAutoFill} disabled={isGenerating} className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-transparent text-yellow-400 border-2 border-yellow-400 hover:bg-yellow-400/20 transition-all shadow-sm" title="The Rasten Helping Hand">{isGenerating ? <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" /> : <WandIcon />}</button>
             </div>
          )}
          {KNOCKOUT_STAGES.map((stage) => (
            <button key={stage} onClick={() => setActiveKnockoutRound(stage)} className={`flex-shrink-0 px-4 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-black transition-all relative overflow-hidden ${activeKnockoutRound === stage ? "bg-white text-slate-900 scale-105 shadow-lg" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}>
              <span className="relative z-10">{getRoundShortName(stage)}</span>
              {activeKnockoutRound === stage && <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: STAGE_COLORS[stage] || '#ccc', boxShadow: `0 0 8px ${STAGE_COLORS[stage]}` }} />}
              <span className={`w-1.5 h-1.5 rounded-full mt-0.5 relative z-10 ${getKnockoutDot(stage)}`} />
            </button>
          ))}
          <div className="w-px h-6 bg-white/20 mx-1" />
          <button onClick={() => setActiveKnockoutRound("TREE")} className={`flex-shrink-0 px-3 h-10 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-wider transition-all relative overflow-hidden ${activeKnockoutRound === "TREE" ? "bg-purple-500 text-white shadow-lg" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}>
              <span className="relative z-10">🌳 Tree</span>
              {activeKnockoutRound === "TREE" && <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: STAGE_COLORS["TREE"], boxShadow: `0 0 8px ${STAGE_COLORS["TREE"]}` }} />}
          </button>
        </div>
      )}

      {saveStatus && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur text-slate-900 px-4 py-1.5 rounded-full shadow-xl z-50 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
           {saveStatus === 'saving' ? (<><div className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> Saving...</>) : (<><span className="text-green-600">✓</span> Saved</>)}
        </div>
      )}
    </header>
  );
}