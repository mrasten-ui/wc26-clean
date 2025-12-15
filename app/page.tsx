"use client";
import { useState, Suspense, useEffect, useMemo } from "react"; 
import { supabase } from "../lib/supabase"; 

import { useAppData } from "../hooks/useAppData"; 
import { usePrediction } from "../hooks/usePrediction"; 
import { calculateGroupStandings, calculateThirdPlaceStandings } from "../lib/calculator"; 
import { calculateBracketMapping } from "../lib/bracket"; 
import { TRANSLATIONS, GROUPS, KNOCKOUT_STAGES, COLORS, TEAM_NAMES, TEAM_NICKNAMES, TEAM_NAMES_NO } from "../lib/constants"; 
import { Match, TeamData, Prediction, BracketMap } from "../lib/types"; 

import Header from "../components/Header"; 
import Leaderboard from "../components/Leaderboard";
import Bracket from "../components/Bracket";
import GroupStage from "../components/GroupStage";
import MatchCenter from "../components/MatchCenter";
import AutoFillModal from "../components/AutoFillModal"; 
import RulesModal from "../components/RulesModal";

const WelcomeListener = ({ onOpen }: { onOpen: () => void }) => { return null; };
const LoadingComponent = ({ t, COLORS }: { t: any, COLORS: any }) => (
    <div className="min-h-screen flex items-center justify-center text-white font-bold animate-pulse" style={{ backgroundColor: COLORS.navy }}>{t.loading || "Loading..."}</div>
);

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
  const { 
    user, matches, predictions, setPredictions, allPredictions, leaderboard, 
    champion, allTeams, revealCount, setRevealCount, loading, 
  } = useAppData(); 
  
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

  const { handlePredict, handleReveal, revealedMatches, saveStatus, handleAutoFill } = usePrediction(
    supabase, user, matches, predictions, setPredictions, allPredictions, revealCount, setRevealCount, leaderboard, setActiveTab
  );
  
  const t = TRANSLATIONS[lang];

  const currentMainTab = 
    (activeTab === "BRACKET" || activeTab === "KNOCKOUT" || KNOCKOUT_STAGES.includes(activeTab)) ? "KNOCKOUT" : 
    (activeTab === "RULES" ? "RULES" : 
    (activeTab === "RESULTS" ? "RESULTS" : 
    (activeTab === "MATCHES" ? "MATCHES" : 
    "GROUPS")));

  // Filter valid matches
  // Relaxed filter to ensure knockout matches (which have codes, not team IDs initially) are visible
  const allValidMatches = matches.filter(m => (m.home_team && m.away_team) || m.home_code || m.stage !== 'GROUP');

  const matchesByGroup = allValidMatches.reduce((acc, m) => { 
      if (!m.home_team) return acc;
      const gid = m.home_team.group_id; 
      if (gid !== 'X') (acc[gid] ||= []).push(m); 
      return acc; 
  }, {} as Record<string, Match[]>);

  // --- COMPLETION LOGIC ---
  const allGroupMatches = allValidMatches.filter(m => m.stage === 'GROUP');
  const totalGroupMatches = allGroupMatches.length; // Should be 72
  const predictedGroupCount = allGroupMatches.filter(m => {
      const p = predictions[m.id];
      return p && p.home_score !== null && p.away_score !== null;
  }).length;
  
  // Strict check: Unlock bracket ONLY when all group games are predicted
  const isTournamentComplete = totalGroupMatches > 0 && predictedGroupCount === totalGroupMatches;
  
  const matchesCompletedCount = allValidMatches.filter((m: any) => m.home_score !== undefined && m.home_score !== null).length;
  const hasPredictions = Object.keys(predictions).length > 0;
  
  // --- BRACKET CALCULATIONS ---
  // @ts-ignore
  const groupStandings: Record<string, any> = {};
  GROUPS.forEach(g => { groupStandings[g] = calculateGroupStandings(matchesByGroup[g] || [], predictions); });
  // @ts-ignore
  const thirdPlaceTable = calculateThirdPlaceStandings(allGroupMatches, predictions);
  
  const bracketMap = useMemo(() => {
      if (!matches || matches.length === 0) return {} as BracketMap;
      // Pass 'predictions' so the bracket knows who you picked!
      return calculateBracketMapping(groupStandings, thirdPlaceTable, matches, predictions);
  }, [groupStandings, thirdPlaceTable, matches, predictions]);

  const getTeamNameForComponent = (id: string, def: string) => getTeamName(id, def, lang, showNicknames);

  // --- STATUS CHECKERS (DOT COLORS) ---
  const getGroupStatus = (gid: string): StatusType => { 
      const ms = matchesByGroup[gid] || []; 
      if (ms.length === 0) return 'empty';
      const completed = ms.filter(m => predictions[m.id]?.home_score !== null && predictions[m.id]?.away_score !== null).length;
      if (completed === ms.length) return 'complete';
      if (completed > 0) return 'partial';
      return 'empty';
  };
  
  const getMainTabStatus = (tab: "GROUPS" | "KNOCKOUT"): StatusType => {
    if (loading || matches.length === 0) return 'empty';
    if (tab === "GROUPS") return isTournamentComplete ? 'complete' : (predictedGroupCount > 0 ? 'partial' : 'empty');
    if (tab === "KNOCKOUT") {
        const knockoutMatches = matches.filter(m => m.stage !== 'GROUP');
        const predictedKnockout = knockoutMatches.filter(m => predictions[m.id]?.winner_id).length;
        if (predictedKnockout === knockoutMatches.length) return 'complete';
        if (predictedKnockout > 0) return 'partial';
        return 'empty';
    }
    return 'empty';
  };
  
  const getKnockoutStatus = (stage: string): StatusType => {
      if (stage === 'TREE') return 'partial'; 
      
      const stageMatches = matches.filter(m => m.stage === stage);
      if (stageMatches.length === 0) return 'empty';
      
      const predictedCount = stageMatches.filter(m => predictions[m.id]?.winner_id).length;
      
      if (predictedCount === 0) return 'empty'; // Gray
      if (predictedCount === stageMatches.length) return 'complete'; // Green
      return 'partial'; // Orange
  };

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

  const isBracketMode = activeTab === "BRACKET" || currentMainTab === "KNOCKOUT";
  const showTools = currentMainTab === "GROUPS" || isBracketMode;

  const handleSmartAutoFill = () => isBracketMode ? handleKnockoutAutoFill() : handleGroupAutoFill();
  const handleKnockoutAutoFill = () => { setActiveTab('KNOCKOUT'); setActiveKnockoutRound('R32'); setIsAutoFillModalOpen(true); };
  const handleGroupAutoFill = () => { setActiveTab('A'); setIsAutoFillModalOpen(true); };

  const handleSmartClear = () => {
      if(confirm(lang === 'no' ? "Er du sikker? Dette sletter alle tips i denne delen." : "Are you sure? This will delete all predictions in this section.")) {
          handleClearPredictions();
      }
  };

  if (loading) return <LoadingComponent t={t} COLORS={COLORS} />;

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 pb-20" style={{ backgroundColor: COLORS.light }}>
      <Header 
        user={user} activeTab={activeTab} setActiveTab={setActiveTab} currentMainTab={currentMainTab}
        activeKnockoutRound={activeKnockoutRound} setActiveKnockoutRound={setActiveKnockoutRound}
        saveStatus={saveStatus} revealCount={revealCount} isGenerating={false}
        handleGroupAutoFill={handleGroupAutoFill} 
        handleKnockoutAutoFill={handleKnockoutAutoFill}
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
    </div>
  );
}