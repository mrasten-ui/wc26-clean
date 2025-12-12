// components/Header.tsx
"use client";
import { UserData } from '../lib/types';
import { getFlagUrl } from '../lib/flags';
import { COLORS } from '../lib/constants'; // Assuming constants are correctly imported

// --- Header Props Interface ---
interface HeaderProps {
    user: UserData | null;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    currentMainTab: string;
    activeKnockoutRound: string;
    setActiveKnockoutRound: (stage: string) => void;
    
    // 🔥 THE FIX: Includes 'idle' to match the type being passed from usePrediction.ts
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
    t: any; // Translations object
    getMainTabStatus: (tab: 'GROUPS' | 'KNOCKOUT') => 'empty' | 'partial' | 'complete';
    getGroupStatus: (gid: string) => 'empty' | 'partial' | 'complete';
    getKnockoutStatus: (stage: string) => 'empty' | 'partial' | 'complete';
    predictions: Record<number, any>;
    totalMatchesCount: number;
    matchesCompletedCount: number;
    showNicknames: boolean;
    setShowNicknames: (show: boolean) => void;
}
// --- End Header Props Interface ---


export default function Header({
    user,
    activeTab,
    setActiveTab,
    currentMainTab,
    activeKnockoutRound,
    setActiveKnockoutRound,
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
    predictions,
    totalMatchesCount,
    matchesCompletedCount,
    showNicknames,
    setShowNicknames,
}: HeaderProps) {
    
    const isGroupsTab = currentMainTab === "GROUPS";
    const isKnockoutTab = currentMainTab === "KNOCKOUT";
    const isRulesTab = activeTab === "RULES";
    const isResultsTab = activeTab === "RESULTS";

    const isGroupLetter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].includes(activeTab);

    // Helper for saving status indicator
    const renderSaveStatus = () => {
        if (saveStatus === 'saving') {
            return <span className="text-yellow-400 font-bold animate-pulse text-xs">{t.processing || 'SAVING...'}</span>;
        }
        if (saveStatus === 'saved') {
            return <span className="text-green-400 font-bold text-xs">{t.saved || 'SAVED'}</span>;
        }
        return <span className="text-blue-300 opacity-50 text-xs">{t.ready || 'READY'}</span>;
    };
    
    const handleMainTabChange = (tab: string) => {
        if (tab === "GROUPS" && !isGroupLetter) {
            setActiveTab("A"); // Default to Group A
        } else if (tab === "KNOCKOUT" && !isKnockoutTab) {
            setActiveTab("KNOCKOUT");
            setActiveKnockoutRound("R32"); // Default to R32
        } else {
            setActiveTab(tab);
        }
    };

    return (
        <header className="fixed top-0 left-0 w-full z-30 shadow-lg" style={{ backgroundColor: COLORS.navy }}>
            
            {/* TOP BAR: Logo, Status, Logout */}
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-700">
                
                {/* Logo & App Name */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('A')}>
                    <img src="/icon-192.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <h1 className="text-lg font-black text-white uppercase tracking-tighter hidden sm:block">{t.appName}</h1>
                </div>

                {/* Status Indicator & User Info */}
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-white text-sm font-bold leading-none">{user?.full_name || 'Guest'}</p>
                        <div className="mt-1">
                            {renderSaveStatus()}
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-3 py-1 rounded transition-colors shadow-md"
                    >
                        {t.logout}
                    </button>
                </div>
            </div>

            {/* MAIN NAVIGATION TABS */}
            <div className="flex justify-between sm:justify-center border-b border-slate-700 bg-slate-800">
                <nav className="flex space-x-0.5 sm:space-x-1 p-1">
                    {/* GROUPS TAB */}
                    <button
                        onClick={() => handleMainTabChange("GROUPS")}
                        className={`px-3 py-1.5 text-xs font-black uppercase rounded transition-all ${
                            isGroupsTab 
                                ? 'bg-white text-slate-900 shadow-lg' 
                                : 'text-slate-300 hover:text-white'
                        }`}
                    >
                        {t.groupStage}
                    </button>

                    {/* KNOCKOUT TAB */}
                    <button
                        onClick={() => handleMainTabChange("KNOCKOUT")}
                        className={`px-3 py-1.5 text-xs font-black uppercase rounded transition-all ${
                            isKnockoutTab 
                                ? 'bg-white text-slate-900 shadow-lg' 
                                : 'text-slate-300 hover:text-white'
                        }`}
                    >
                        {t.knockout}
                    </button>
                    
                    {/* RESULTS TAB */}
                    <button
                        onClick={() => setActiveTab("RESULTS")}
                        className={`px-3 py-1.5 text-xs font-black uppercase rounded transition-all ${
                            isResultsTab 
                                ? 'bg-white text-slate-900 shadow-lg' 
                                : 'text-slate-300 hover:text-white'
                        }`}
                    >
                        {t.results}
                    </button>
                </nav>
                
                {/* Language Selector (Tucked into the corner) */}
                <div className="flex space-x-1 p-2">
                    {(['en', 'no', 'us', 'sc'] as ('en' | 'no' | 'us' | 'sc')[]).map((l) => (
                        <button key={l} onClick={() => setLang(l)} className={`transition-all rounded overflow-hidden shadow-sm ${lang === l ? 'ring-2 ring-yellow-400' : 'opacity-50 hover:opacity-100'}`}>
                            <img src={getFlagUrl(l)} alt={l} className="w-6 h-4 object-cover" />
                        </button>
                    ))}
                </div>
            </div>

            {/* SECONDARY NAVIGATION (Groups or Knockout Rounds) */}
            <div className="p-2 border-b border-slate-700 overflow-x-auto" style={{ backgroundColor: COLORS.navy }}>
                {isGroupsTab && (
                    <div className="flex space-x-1.5 justify-center sm:justify-start mx-auto w-full max-w-xl">
                        {/* Group Selection Buttons */}
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((g) => (
                            <button
                                key={g}
                                onClick={() => setActiveTab(g)}
                                className={`w-8 h-8 rounded-full text-xs font-black transition-all border ${
                                    activeTab === g
                                        ? 'bg-white text-slate-900 border-yellow-400 ring-2 ring-yellow-400'
                                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                }`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                )}

                {isKnockoutTab && (
                    <div className="flex space-x-1.5 justify-center sm:justify-start mx-auto w-full max-w-xl">
                        {/* Knockout Round Selection Buttons */}
                        {['R32', 'R16', 'QF', 'SF', '3RD', 'FINAL'].map((stage) => (
                            <button
                                key={stage}
                                onClick={() => setActiveKnockoutRound(stage)}
                                style={{ backgroundColor: stage === 'FINAL' ? COLORS.gold : undefined }}
                                className={`px-3 py-1 rounded-full text-xs font-black transition-all shadow-sm ${
                                    activeKnockoutRound === stage
                                        ? 'bg-white text-slate-900 ring-2 ring-yellow-400'
                                        : stage === 'FINAL'
                                            ? 'text-slate-900'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                {t[stage.toLowerCase()] || stage}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ACTION ROW: Auto-fill, Clear, Rules */}
            <div className="p-2 flex justify-between items-center text-slate-400" style={{ backgroundColor: COLORS.navy }}>
                <div className="flex items-center space-x-3">
                    {/* Clear Button */}
                    <button 
                        onClick={handleClearPredictions}
                        className="flex items-center gap-1 text-[10px] font-black uppercase hover:text-red-400 transition-colors disabled:opacity-30"
                        disabled={!hasPredictions}
                        title="Clear All Predictions"
                    >
                        🗑️ {t.clear || 'Clear'}
                    </button>
                    
                    {/* Helping Hand (Auto-fill) */}
                    <button 
                        onClick={isKnockoutTab ? handleKnockoutAutoFill : handleGroupAutoFill}
                        className="flex items-center gap-1 text-[10px] font-black uppercase hover:text-yellow-400 transition-colors"
                        title="Rasten Helping Hand"
                    >
                        ✨ {t.autoFill || 'Helping Hand'}
                    </button>
                </div>

                <button onClick={() => alert("Rules")} className="text-[10px] font-black uppercase hover:text-white transition-colors">
                    {t.rules}
                </button>
            </div>
            
        </header>
    );
}