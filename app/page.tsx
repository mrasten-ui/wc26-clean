"use client";
import { useState, Suspense, useEffect } from "react";
// NOTE: You must ensure these custom hooks and components exist in your project:
// hooks/useAppData.ts, hooks/usePrediction.ts
// components/Header.tsx, components/Leaderboard.tsx, components/Bracket.tsx, components/GroupStage.tsx
// components/MatchCenter.tsx, components/AutoFillModal.tsx, components/RulesModal.tsx
import { useAppData } from "../hooks/useAppData";
import { usePrediction } from "../hooks/usePrediction";
import { calculateGroupStandings, calculateThirdPlaceStandings } from "../lib/calculator";
import { calculateBracketMapping } from "../lib/bracket";
import { getFlagUrl } from "../lib/flags";
import { TRANSLATIONS, GROUPS, KNOCKOUT_STAGES, COLORS, TEAM_NAMES, TEAM_NICKNAMES, TEAM_NAMES_NO } from "../lib/constants";
import { Match, TeamData } from "../lib/types"; // Ensure TeamData is imported if used

// Components
import Header from "../components/Header";
import Leaderboard from "../components/Leaderboard";
import Bracket from "../components/Bracket";
import GroupStage from "../components/GroupStage";
import MatchCenter from "../components/MatchCenter";
import AutoFillModal from "../components/AutoFillModal"; 
import RulesModal from "../components/RulesModal";

// Placeholder components (Assume they are imported/defined elsewhere)
const WelcomeListener = ({ onOpen }: { onOpen: () => void }) => { return null; };
const LoadingComponent = ({ t, COLORS }: { t: any, COLORS: any }) => (
    <div className="min-h-screen flex items-center justify-center text-white font-bold animate-pulse" style={{ backgroundColor: COLORS.navy }}>{t.loading || "Loading..."}</div>
);

// Helper to get team name (needed for derived data)
const getTeamName = (id: string, def: string, lang: string, showNicknames: boolean) => {
    const langKey = lang as 'en' | 'no' | 'us' | 'sc';
    const teamMap = TEAM_NAMES[langKey] || TEAM_NAMES.en;
    if (showNicknames && TEAM_NICKNAMES[langKey]?.[def]) {
        return TEAM_NICKNAMES[langKey][def];
    }
    return teamMap[def] || def;
};


export default function Home() {
  // 1. Load Data (Custom Hook - assuming existence)
  const { user, matches, setMatches, predictions, setPredictions, allPredictions, leaderboard, champion, setChampion, allTeams, revealCount, setRevealCount, loading, supabase } = useAppData();
  
  // 2. Handle Logic (Custom Hook - assuming existence)
  const { handlePredict, handleReveal, revealedMatches, saveStatus } = usePrediction(supabase, user, matches, predictions, setPredictions, allPredictions, revealCount, setRevealCount, leaderboard);

  // 3. UI State
  const [activeTab, setActiveTab] = useState("A"); 
  const [activeKnockoutRound, setActiveKnockoutRound] = useState("R32");
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isAutoFillModalOpen, setIsAutoFillModalOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'no' | 'us' | 'sc'>('en');
  const [showNicknames, setShowNicknames] = useState(false);
  
  // Load language preference from Local Storage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("wc26_lang");
    if (savedLang && ['en', 'no', 'us', 'sc'].includes(savedLang)) {
      setLang(savedLang as 'en' | 'no' | 'us' | 'sc');
    }
  }, []);

  const t = TRANSLATIONS[lang];
  const currentMainTab = (activeTab === "KNOCKOUT" || KNOCKOUT_STAGES.includes(activeTab)) ? "KNOCKOUT" : (activeTab === "RULES" ? "RULES" : (activeTab === "RESULTS" ? "RESULTS" : (activeTab === "MATCHES" ? "MATCHES" : "GROUPS")));

  // 4. Derived Data (Calculated on the fly)
  const allValidMatches = matches.filter(m => m.home_team && m.away_team);

  const matchesByGroup = allValidMatches.reduce((acc, m) => { 
      if (!m.home_team) return acc;
      const gid = m.home_team.group_id; 
      if (gid !== 'X') (acc[gid] ||= []).push(m); 
      return acc; 
  }, {} as Record<string, Match[]>);

  const allGroupMatches = allValidMatches.filter(m => m.stage === 'GROUP');
  const totalMatches = allGroupMatches.length;

  const predictedCount = Object.values(predictions || {}).filter(p => { 
      const m = allValidMatches.find(m => m.id === p.match_id); 
      return m && m.stage === 'GROUP' && p.home_score !== null && p.away_score !== null; 
  }).length;
  
  const isTournamentComplete = totalMatches > 0 && predictedCount === totalMatches;
  const matchesCompletedCount = allValidMatches.filter((m: any) => m.home_score !== undefined && m.home_score !== null).length;
  
  const hasGroupData = allValidMatches.some(m => m.stage === 'GROUP' && typeof predictions[m.id]?.home_score === 'number');
  const hasKnockoutData = allValidMatches.some(m => m.stage !== 'GROUP' && !!predictions[m.id]?.winner_id);
  const hasPredictions = currentMainTab === "GROUPS" ? hasGroupData : hasKnockoutData;


  // @ts-ignore
  const groupStandings: Record<string, any> = {};
  GROUPS.forEach(g => { groupStandings[g] = calculateGroupStandings(matchesByGroup[g] || [], predictions); });
  // @ts-ignore
  const thirdPlaceTable = calculateThirdPlaceStandings(allGroupMatches, predictions);
  
  // @ts-ignore
  const bracketMap = calculateBracketMapping(groupStandings, thirdPlaceTable, predictions, allValidMatches.filter(m => m.stage !== 'GROUP'));

  const getTeamNameForComponent = (id: string, def: string) => getTeamName(id, def, lang, showNicknames);

  // 5. Helper Functions
  const getGroupStatus = (gid: string) => { const ms = matchesByGroup[gid] || []; return ms.every(m => predictions[m.id]?.home_score !== null) ? 'complete' : ms.some(m => predictions[m.id]?.home_score !== null) ? 'partial' : 'empty'; };
  const getMainTabStatus = (tab: "GROUPS" | "KNOCKOUT") => {
    if (loading || matches.length === 0) return 'empty';
    if (tab === "GROUPS") return isTournamentComplete ? 'complete' : (predictedCount > 0 ? 'partial' : 'empty');
    return isTournamentComplete ? (Object.values(predictions).filter(p => p.winner_id && p.match_id > 72).length === 32 ? 'complete' : 'partial') : 'empty';
  };
  const getKnockoutStatus = (stage: string) => { return 'partial'; };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  
  const handleClearPredictions = async () => { /* Logic hidden for brevity */ };


  if (loading) return <LoadingComponent t={t} COLORS={COLORS} />;

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 pb-20" style={{ backgroundColor: COLORS.light }}>
      <Header 
        user={user} activeTab={activeTab} setActiveTab={setActiveTab} currentMainTab={currentMainTab}
        activeKnockoutRound={activeKnockoutRound} setActiveKnockoutRound={setActiveKnockoutRound}
        saveStatus={saveStatus} revealCount={revealCount} isGenerating={false}
        handleGroupAutoFill={() => { setActiveTab('A'); setIsAutoFillModalOpen(true); }} // Directs to Group A for fill
        handleKnockoutAutoFill={() => { setActiveTab('KNOCKOUT'); setActiveKnockoutRound('R32'); setIsAutoFillModalOpen(true); }}
        handleClearPredictions={handleClearPredictions} hasPredictions={hasPredictions} 
        isTournamentComplete={isTournamentComplete} handleLogout={handleLogout}
        lang={lang} setLang={setLang as any} t={t} getMainTabStatus={getMainTabStatus} getGroupStatus={getGroupStatus}
        getKnockoutStatus={getKnockoutStatus} onOpenRules={() => setIsRulesModalOpen(true)}
        predictions={predictions} totalMatchesCount={matches.length} matchesCompletedCount={matchesCompletedCount}
        showNicknames={showNicknames} setShowNicknames={setShowNicknames} 
      />

      {/* GLOBAL CONTENT WRAPPER: RESTRICTED WIDTH HERE */}
      <div className={`flex-1 p-4 mx-auto w-full ${activeKnockoutRound === 'TREE' && currentMainTab === 'KNOCKOUT' ? 'max-w-[1600px]' : 'max-w-xl'}`}>
        
        {activeTab === "RESULTS" && <Leaderboard leaderboard={leaderboard} t={t} matches={allValidMatches} allPredictions={allPredictions} user={user} lang={lang} />}
        
        {activeTab === "MATCHES" && (
            <MatchCenter matches={allValidMatches} predictions={predictions} t={t} onCompare={() => {}} />
        )}

        {/* KNOCKOUT BRACKET */}
        {currentMainTab === "KNOCKOUT" && (
            <Bracket 
                activeKnockoutRound={activeKnockoutRound}
                setActiveKnockoutRound={setActiveKnockoutRound}
                knockoutStages={KNOCKOUT_STAGES} 
                matches={allValidMatches.filter(m => m.stage !== 'GROUP')}
                predictions={predictions} 
                bracketMap={bracketMap} 
                // Passing a simplified teams map for efficiency
                teamsMap={allTeams.reduce((acc, team) => { acc[team.id] = team; return acc; }, {} as Record<string, TeamData>)}
                handlePredict={handlePredict} 
                isTournamentComplete={isTournamentComplete}
                champion={champion} 
                handleBonusPick={() => {}} // Placeholder
                t={t} 
                lang={lang}
                venueZones={{}} 
                getTeamName={getTeamNameForComponent} 
                teamNamesNo={TEAM_NAMES_NO}
            />
        )}
        
        {/* GROUP STAGE VIEW (Active when a group letter is selected) */}
        {currentMainTab === "GROUPS" && activeTab !== "SUMMARY" && activeTab !== "RULES" && activeTab !== "RESULTS" && activeTab !== "MATCHES" && (
             <GroupStage 
                getTeamName={getTeamNameForComponent}
                activeTab={activeTab} 
                setActiveTab={setActiveTab}
                matchesByGroup={matchesByGroup} 
                predictions={predictions}
                handlePredict={handlePredict} 
                leaderboard={leaderboard} 
                allPredictions={allPredictions} 
                user={user} 
                revealCount={revealCount} 
                handleRevealSelection={handleReveal} 
                revealedMatches={revealedMatches} 
                t={t} 
                lang={lang} 
             />
        )}
        
        {/* SUMMARY (Placeholder for now) */}
        {activeTab === "SUMMARY" && (
           <div className="bg-white p-6 rounded-xl shadow-xl text-center">
               <h2 className="font-bold text-slate-800">Group Summary</h2>
               <p className="text-sm text-slate-500">Coming soon in refactored version.</p>
           </div>
        )}
      </div>

      <Suspense fallback={null}>
          <WelcomeListener onOpen={() => setIsRulesModalOpen(true)} />
      </Suspense>

      <AutoFillModal 
          isOpen={isAutoFillModalOpen} 
          onClose={() => setIsAutoFillModalOpen(false)} 
          onConfirm={(teams) => alert(`Simulation running for: ${teams.join(', ')}`)} // Placeholder action
          allTeams={allTeams} 
          lang={lang} 
          t={t} 
      />
      <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} t={t} lang={lang} />
    </div>
  );
}