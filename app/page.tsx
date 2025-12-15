"use client";
import { useState, Suspense, useEffect, useMemo } from "react"; 
import { createClient } from "@supabase/supabase-js"; 
// ✅ CORRECT PATHS: Go up one level (../) to find hooks/lib/components
// Your folder structure is: root -> app -> page.tsx
// So ../ takes you to root, then into hooks/lib/components
import { useAppData } from "../hooks/useAppData"; 
import { usePrediction } from "../hooks/usePrediction"; 
import { calculateGroupStandings, calculateThirdPlaceStandings } from "../lib/calculator"; 
import { calculateBracketMapping } from "../lib/bracket"; 
import { getFlagUrl } from "../lib/flags"; 
import { TRANSLATIONS, GROUPS, KNOCKOUT_STAGES, COLORS, TEAM_NAMES, TEAM_NICKNAMES, TEAM_NAMES_NO } from "../lib/constants"; 
import { Match, TeamData, Prediction, BracketMap } from "../lib/types"; 

// Components
import Header from "../components/Header"; 
import Leaderboard from "../components/Leaderboard";
import Bracket from "../components/Bracket";
import GroupStage from "../components/GroupStage";
import MatchCenter from "../components/MatchCenter";
import AutoFillModal from "../components/AutoFillModal"; 
import RulesModal from "../components/RulesModal";
// ✅ IMPORT THE DIAGNOSTICS TOOL
import DebugSaver from "../components/DebugSaver"; 

// --- CLIENT SETUP ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// --- END CLIENT SETUP ---

const WelcomeListener = ({ onOpen }: { onOpen: () => void }) => { return null; };
const LoadingComponent = ({ t, COLORS }: { t: any, COLORS: any }) => (
    <div className="min-h-screen flex items-center justify-center text-white font-bold animate-pulse" style={{ backgroundColor: COLORS.navy }}>{t.loading || "Loading..."}</div>
);

// Helper to get team name
const getTeamName = (id: string, def: string, lang: string, showNicknames: boolean) => {
    const langKey = lang as 'en' | 'no' | 'us' | 'sc';
    const teamMap = TEAM_NAMES[langKey] || TEAM_NAMES.en;
    if (showNicknames && TEAM_NICKNAMES[langKey]?.[def]) {
        return TEAM_NICKNAMES[langKey][def];
    }
    return teamMap[def] || def;
};

type StatusType = "empty" | "partial" | "complete";

export default function Home() {
  const supabase = supabaseClient;
  
  // 1. Load Data
  const { 
    user, matches, predictions, setPredictions, allPredictions, leaderboard, 
    champion, allTeams, revealCount, setRevealCount, loading, 
  } = useAppData(); 
  
  // 2. UI State
  const [activeTab, setActiveTab] = useState("A"); 
  const [activeKnockoutRound, setActiveKnockoutRound] = useState("R32");
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isAutoFillModalOpen, setIsAutoFillModalOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'no' | 'us' | 'sc'>('en');
  const [showNicknames, setShowNicknames] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("wc26_lang");
    if (savedLang && ['en', 'no', 'us', 'sc'].includes(savedLang)) {
      setLang(savedLang as 'en' | 'no' | 'us' | 'sc');
    }
  }, []);

  // 3. Handle Logic 
  const { handlePredict, handleReveal, revealedMatches, saveStatus, handleAutoFill } = usePrediction(
    supabase, user, matches, predictions, setPredictions, allPredictions, revealCount, setRevealCount, leaderboard, setActiveTab
  );
  
  const t = TRANSLATIONS[lang];
  const currentMainTab = (activeTab === "KNOCKOUT" || KNOCKOUT_STAGES.includes(activeTab)) ? "KNOCKOUT" : (activeTab === "RULES" ? "RULES" : (activeTab === "RESULTS" ? "RESULTS" : (activeTab === "MATCHES" ? "MATCHES" : "GROUPS")));

  // 4. Derived Data 
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
  const hasPredictions = Object.keys(predictions).length > 0;
  
  // @ts-ignore
  const groupStandings: Record<string, any> = {};
  GROUPS.forEach(g => { groupStandings[g] = calculateGroupStandings(matchesByGroup[g] || [], predictions); });
  
  // @ts-ignore
  const thirdPlaceTable = calculateThirdPlaceStandings(allGroupMatches, predictions);
  
  const bracketMap = useMemo(() => {
      if (!matches || matches.length === 0) return {} as BracketMap;
      return calculateBracketMapping(groupStandings, thirdPlaceTable, matches);
  }, [groupStandings, thirdPlaceTable, matches]);

  const getTeamNameForComponent = (id: string, def: string) => getTeamName(id, def, lang, showNicknames);

  // 5. Helper Functions
  const getGroupStatus = (gid: string): StatusType => { 
      const ms = matchesByGroup[gid] || []; 
      if (ms.length === 0) return 'empty';
      if (ms.every(m => predictions[m.id]?.home_score !== null)) return 'complete';
      if (ms.some(m => predictions[m.id]?.home_score !== null)) return 'partial';
      return 'empty';
  };
  
  const getMainTabStatus = (tab: "GROUPS" | "KNOCKOUT"): StatusType => {
    if (loading || matches.length === 0) return 'empty';
    if (tab === "GROUPS") return isTournamentComplete ? 'complete' : (predictedCount > 0 ? 'partial' : 'empty');
    if (tab === "KNOCKOUT") return 'partial'; 
    return 'empty';
  };
  
  const getKnockoutStatus = (stage: string): StatusType => 'partial';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  
  const handleClearPredictions = async () => { 
    if (!user || !user.id) return;
    if (confirm("Are you sure you want to clear ALL your predictions?")) {
      const { error } = await supabase.from('predictions').delete().eq('user_id', user.id);
      if (!error) {
        setPredictions({});
        alert("All predictions cleared.");
      }
    }
  };

  if (loading) return <LoadingComponent t={t} COLORS={COLORS} />;

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 pb-20" style={{ backgroundColor: COLORS.light }}>
      <Header 
        user={user} activeTab={activeTab} setActiveTab={setActiveTab} currentMainTab={currentMainTab}
        activeKnockoutRound={activeKnockoutRound} setActiveKnockoutRound={setActiveKnockoutRound}
        saveStatus={saveStatus} revealCount={revealCount} isGenerating={false}
        handleGroupAutoFill={() => { setActiveTab('A'); setIsAutoFillModalOpen(true); }} 
        handleKnockoutAutoFill={() => { setActiveTab('KNOCKOUT'); setActiveKnockoutRound('R32'); setIsAutoFillModalOpen(true); }}
        handleClearPredictions={handleClearPredictions} hasPredictions={hasPredictions} 
        isTournamentComplete={isTournamentComplete} handleLogout={handleLogout}
        lang={lang} setLang={setLang as any} t={t} getMainTabStatus={getMainTabStatus} getGroupStatus={getGroupStatus}
        getKnockoutStatus={getKnockoutStatus} onOpenRules={() => setIsRulesModalOpen(true)}
        predictions={predictions} totalMatchesCount={matches.length} matchesCompletedCount={matchesCompletedCount}
        showNicknames={showNicknames} setShowNicknames={setShowNicknames} 
      />

      <div className={`flex-1 p-4 mx-auto w-full ${activeKnockoutRound === 'TREE' && currentMainTab === 'KNOCKOUT' ? 'max-w-[1600px]' : 'max-w-xl'}`}>
        
        {activeTab === "RESULTS" && <Leaderboard leaderboard={leaderboard} t={t} matches={allValidMatches} allPredictions={allPredictions} user={user} lang={lang} />}
        
        {activeTab === "MATCHES" && (
            <MatchCenter matches={allValidMatches} predictions={predictions} t={t} onCompare={() => {}} />
        )}

        {currentMainTab === "KNOCKOUT" && (
            <Bracket 
                activeKnockoutRound={activeKnockoutRound}
                setActiveKnockoutRound={setActiveKnockoutRound}
                knockoutStages={KNOCKOUT_STAGES} 
                matches={allValidMatches.filter(m => m.stage !== 'GROUP')}
                predictions={predictions} 
                bracketMap={bracketMap} 
                teamsMap={allTeams.reduce((acc, team) => { acc[team.id] = team; return acc; }, {} as Record<string, TeamData>)}
                handlePredict={handlePredict} 
                isTournamentComplete={isTournamentComplete}
                champion={champion} 
                handleBonusPick={() => {}} 
                t={t} 
                lang={lang}
                venueZones={{}} 
                getTeamName={getTeamNameForComponent} 
                teamNamesNo={TEAM_NAMES_NO}
            />
        )}
        
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
          onConfirm={(teams) => handleAutoFill(teams, activeTab)} 
          allTeams={allTeams} 
          lang={lang} 
          t={t} 
      />
      <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} t={t} lang={lang} />
      
      {/* ✅ DEBUGGER ADDED HERE */}
      <DebugSaver user={user} />
      
    </div>
  );
}