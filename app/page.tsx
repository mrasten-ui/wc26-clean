"use client";
import { useState, Suspense } from "react";
import { useAppData } from "../hooks/useAppData";
import { usePrediction } from "../hooks/usePrediction";
import { calculateGroupStandings, calculateThirdPlaceStandings } from "../lib/calculator";
import { calculateBracketMapping } from "../lib/bracket";
import { getFlagUrl } from "../lib/flags";
import { TRANSLATIONS, GROUPS, KNOCKOUT_STAGES, COLORS, TEAM_NAMES, TEAM_NICKNAMES, TEAM_NAMES_NO } from "../lib/constants";
import { Match } from "../lib/types";

// Components
import Header from "../components/Header";
import Leaderboard from "../components/Leaderboard";
import Bracket from "../components/Bracket";
import GroupStage from "../components/GroupStage";
import MatchCenter from "../components/MatchCenter";
import AutoFillModal from "../components/AutoFillModal"; 
import RulesModal from "../components/RulesModal";

export default function Home() {
  // 1. Load Data (Custom Hook)
  const { user, matches, predictions, setPredictions, allPredictions, leaderboard, champion, setChampion, allTeams, revealCount, setRevealCount, loading, supabase } = useAppData();
  
  // 2. Handle Logic (Custom Hook)
  const { handlePredict, handleReveal, revealedMatches, saveStatus } = usePrediction(supabase, user, matches, predictions, setPredictions, allPredictions, revealCount, setRevealCount, leaderboard);

  // 3. UI State
  const [activeTab, setActiveTab] = useState("A"); 
  const [activeKnockoutRound, setActiveKnockoutRound] = useState("R32");
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isAutoFillModalOpen, setIsAutoFillModalOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'no'>('en');
  const [showNicknames, setShowNicknames] = useState(false);

  const t = TRANSLATIONS[lang];
  const currentMainTab = (activeTab === "BRACKET") ? "KNOCKOUT" : (activeTab === "RULES" ? "RULES" : (activeTab === "RESULTS" ? "RESULTS" : (activeTab === "MATCHES" ? "MATCHES" : "GROUPS")));

  // 4. Derived Data (Calculated on the fly)
  const matchesByGroup = matches.reduce((acc, m) => { 
      if (!m.home_team) return acc;
      const gid = m.home_team.group_id; 
      if (gid !== 'X') (acc[gid] ||= []).push(m); 
      return acc; 
  }, {} as Record<string, Match[]>);

  const allGroupMatches = matches.filter(m => m.stage === 'GROUP' && m.home_team);
  const isTournamentComplete = allGroupMatches.length > 0 && allGroupMatches.every(m => predictions[m.id]?.home_score !== null);
  
  // @ts-ignore
  const groupStandings: Record<string, any> = {};
  GROUPS.forEach(g => { groupStandings[g] = calculateGroupStandings(matchesByGroup[g] || [], predictions); });
  // @ts-ignore
  const thirdPlaceTable = calculateThirdPlaceStandings(allGroupMatches, predictions);
  // @ts-ignore
  const bracketMap = calculateBracketMapping(groupStandings, thirdPlaceTable, predictions, matches.filter(m => m.stage !== 'GROUP'));

  // 5. Helper Functions
  const getTeamName = (id: string, def: string) => (showNicknames && TEAM_NICKNAMES[lang]?.[def]) ? TEAM_NICKNAMES[lang][def] : (TEAM_NAMES[lang]?.[def] || def);
  const getGroupStatus = (gid: string) => { const ms = matchesByGroup[gid] || []; return ms.every(m => predictions[m.id]?.home_score !== null) ? 'complete' : ms.some(m => predictions[m.id]?.home_score !== null) ? 'partial' : 'empty'; };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white font-bold animate-pulse" style={{ backgroundColor: COLORS.navy }}>Loading Arena...</div>;

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 pb-20" style={{ backgroundColor: COLORS.light }}>
      <Header 
        user={user} activeTab={activeTab} setActiveTab={setActiveTab} currentMainTab={currentMainTab}
        activeKnockoutRound={activeKnockoutRound} setActiveKnockoutRound={setActiveKnockoutRound}
        saveStatus={saveStatus} revealCount={revealCount} isGenerating={false}
        handleGroupAutoFill={() => setIsAutoFillModalOpen(true)} handleKnockoutAutoFill={() => setIsAutoFillModalOpen(true)}
        handleClearPredictions={() => {}} hasPredictions={true} 
        isTournamentComplete={isTournamentComplete} handleLogout={async () => { await supabase.auth.signOut(); window.location.href = "/login"; }}
        lang={lang} setLang={setLang as any} t={t} getMainTabStatus={() => 'partial'} getGroupStatus={getGroupStatus}
        getKnockoutStatus={() => 'partial'} onOpenRules={() => setIsRulesModalOpen(true)}
        predictions={predictions} totalMatchesCount={matches.length} matchesCompletedCount={0}
        showNicknames={showNicknames} setShowNicknames={setShowNicknames} 
      />

      <div className={`flex-1 p-4 mx-auto w-full ${activeKnockoutRound === 'TREE' ? 'max-w-[1600px]' : 'max-w-2xl'}`}>
        {activeTab === "RESULTS" && <Leaderboard leaderboard={leaderboard} t={t} matches={matches} allPredictions={allPredictions} user={user} lang={lang} />}
        
        {activeTab === "MATCHES" && <MatchCenter matches={matches} predictions={predictions} t={t} onCompare={() => {}} />}

        {activeTab === "BRACKET" && (
            <Bracket activeKnockoutRound={activeKnockoutRound} setActiveKnockoutRound={setActiveKnockoutRound} knockoutStages={KNOCKOUT_STAGES} 
            matches={matches.filter(m => m.stage !== 'GROUP')} predictions={predictions} bracketMap={bracketMap} teamsMap={{}} 
            handlePredict={handlePredict} isTournamentComplete={isTournamentComplete} champion={champion} handleBonusPick={() => {}} 
            t={t} lang={lang} venueZones={{}} getTeamName={getTeamName} teamNamesNo={TEAM_NAMES_NO} />
        )}
        
        {currentMainTab === "GROUPS" && activeTab !== "SUMMARY" && (
             <GroupStage getTeamName={getTeamName} activeTab={activeTab} matchesByGroup={matchesByGroup} predictions={predictions}
             handlePredict={handlePredict} leaderboard={leaderboard} allPredictions={allPredictions} user={user} revealCount={revealCount} 
             handleRevealSelection={handleReveal} revealedMatches={revealedMatches} t={t} lang={lang} setActiveTab={setActiveTab} />
        )}
        
        {activeTab === "SUMMARY" && (
           <div className="bg-white p-4 rounded-xl shadow-lg text-center">
               <h2 className="font-bold text-slate-800">Group Summary</h2>
               <p className="text-sm text-slate-500">Coming soon in refactored version.</p>
           </div>
        )}
      </div>

      <AutoFillModal isOpen={isAutoFillModalOpen} onClose={() => setIsAutoFillModalOpen(false)} onConfirm={() => {}} allTeams={allTeams} lang={lang} t={t} />
      <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} t={t} lang={lang} />
    </div>
  );
}