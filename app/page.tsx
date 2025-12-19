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
    if (!id) return def;
    if (lang === 'no' && TEAM_NAMES_NO[id]) return TEAM_NAMES_NO[id];
    if (showNicknames) {
        // @ts-ignore
        if (TEAM_NICKNAMES[lang]?.[id]) return TEAM_NICKNAMES[lang][id];
    }
    // @ts-ignore
    if (TEAM_NAMES[lang]?.[id]) return TEAM_NAMES[lang][id];
    return def;
};

export default function Home() {
  const { user, matches, predictions, setPredictions, allPredictions, leaderboard, champion, setChampion, allTeams, revealCount, setRevealCount, loading } = useAppData();
  
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState("A");
  const [activeKnockoutRound, setActiveKnockoutRound] = useState("R32");
  
  // ✅ STATE: Main Tab Switcher
  const [currentMainTab, setCurrentMainTab] = useState<"MATCHES" | "GROUPS" | "KNOCKOUT" | "RULES" | "RESULTS">("GROUPS");
  
  const [isAutoFillModalOpen, setIsAutoFillModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [showNicknames, setShowNicknames] = useState(false);
  
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const { handlePredict, handleReveal, revealedMatches, saveStatus, handleAutoFill } = usePrediction(
      supabase, user, matches, predictions, setPredictions, allPredictions, revealCount, setRevealCount, leaderboard, setActiveTab
  );

  useEffect(() => {
    const saved = localStorage.getItem("wc26_lang");
    if (saved) setLang(saved);
  }, []);

  const changeLang = (l: any) => {
      setLang(l);
      localStorage.setItem("wc26_lang", l);
  };

  const matchesByGroup = useMemo(() => {
    const groups: Record<string, Match[]> = {};
    GROUPS.forEach(g => {
        groups[g] = matches.filter(m => m.stage === 'GROUP' && m.home_team?.group_id === g);
    });
    return groups;
  }, [matches]);

  const groupStandings = useMemo(() => {
     const st: Record<string, any[]> = {};
     GROUPS.forEach(g => {
         const groupMatches = matches.filter(m => m.stage === 'GROUP' && m.home_team?.group_id === g);
         st[g] = calculateGroupStandings(groupMatches, predictions);
     });
     return st;
  }, [matches, predictions]);

  const thirdPlaceTable = useMemo(() => calculateThirdPlaceStandings(matches, predictions), [matches, predictions]);
  const bracketMap = useMemo(() => calculateBracketMapping(groupStandings, thirdPlaceTable, matches, predictions), [groupStandings, thirdPlaceTable, matches, predictions]);
  
  const teamsMap = useMemo(() => {
      return allTeams.reduce((acc, t) => { acc[t.id] = t; return acc; }, {} as Record<string, TeamData>);
  }, [allTeams]);

  // AUTO FILL HANDLERS
  const handleSmartAutoFill = () => {
      setIsAutoFillModalOpen(true);
  };

  const handleSmartClear = () => {
      if (confirm("Clear all predictions for this section?")) {
         // Logic to clear would go here
      }
  };
  
  const handleLogout = async () => {
      await supabase.auth.signOut();
      window.location.href = "/login";
  };

  if (loading) return <LoadingComponent t={t} COLORS={COLORS} />;

  // DERIVE STATUS DOTS
  const getSubTabStatusDot = (groupId: string) => {
      const ms = matchesByGroup[groupId] || [];
      if (ms.length === 0) return 'bg-slate-600';
      const predicted = ms.filter(m => predictions[m.id]);
      if (predicted.length === ms.length) return 'bg-green-500';
      if (predicted.length > 0) return 'bg-orange-400';
      return 'bg-slate-600';
  };

  const getKnockoutDot = (stage: string) => {
      const ms = matches.filter(m => m.stage === stage);
      if (ms.length === 0) return 'bg-slate-600';
      const predicted = ms.filter(m => predictions[m.id]?.winner_id);
      if (predicted.length === ms.length) return 'bg-green-500';
      if (predicted.length > 0) return 'bg-orange-400';
      return 'bg-slate-600';
  };

  const isTournamentComplete = Object.values(groupStandings).every(g => g.length === 4 && g.every(t => t.played === 3));

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <Header 
         user={user}
         activeTab={activeTab}
         setActiveTab={setActiveTab}
         activeKnockoutRound={activeKnockoutRound}
         setActiveKnockoutRound={setActiveKnockoutRound}
         currentMainTab={currentMainTab}
         setCurrentMainTab={setCurrentMainTab} // ✅ PASSING THE SETTER
         saveStatus={saveStatus}
         revealCount={revealCount}
         isGenerating={false}
         handleGroupAutoFill={handleSmartAutoFill}
         handleKnockoutAutoFill={handleSmartAutoFill}
         handleClearPredictions={handleSmartClear}
         hasPredictions={Object.keys(predictions).length > 0}
         isTournamentComplete={isTournamentComplete}
         handleLogout={handleLogout}
         lang={lang as any}
         setLang={changeLang}
         t={t}
         getMainTabStatus={() => 'bg-green-500'} 
         getGroupStatus={getSubTabStatusDot}
         getKnockoutStatus={(s: string) => getKnockoutDot(s) === 'bg-green-500' ? 'complete' : 'empty'}
         onOpenRules={() => setIsRulesModalOpen(true)}
         showNicknames={showNicknames}
         setShowNicknames={setShowNicknames}
      />

      {/* ❌ REMOVED: The duplicate "SUB-HEADER TABS" div is gone. */}

      <div className="pt-4 px-2 md:px-0 max-w-5xl mx-auto">
        {currentMainTab === "KNOCKOUT" && (
            <Bracket 
                activeKnockoutRound={activeKnockoutRound}
                setActiveKnockoutRound={setActiveKnockoutRound}
                knockoutStages={KNOCKOUT_STAGES}
                matches={matches}
                predictions={predictions}
                bracketMap={bracketMap}
                teamsMap={teamsMap}
                handlePredict={handlePredict}
                isTournamentComplete={isTournamentComplete} 
                champion={champion}
                t={t}
                getTeamName={(id, def) => getTeamName(id, def, lang, showNicknames)}
            />
        )}

        {currentMainTab === "GROUPS" && (
             <GroupStage 
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
                getTeamName={(id, def) => getTeamName(id, def, lang, showNicknames)}
                standings={groupStandings[activeTab] || []}
             />
        )}
        
        {currentMainTab === "RESULTS" && (
             <Leaderboard leaderboard={leaderboard} t={t} matches={matches} allPredictions={allPredictions} user={user} lang={lang} />
        )}
      </div>

      <Suspense fallback={null}>
          <WelcomeListener onOpen={() => setIsRulesModalOpen(true)} />
      </Suspense>

      <AutoFillModal 
          isOpen={isAutoFillModalOpen} 
          onClose={() => setIsAutoFillModalOpen(false)} 
          onConfirm={(boostedTeams) => handleAutoFill(allTeams, activeTab, boostedTeams)} 
          allTeams={allTeams} 
          lang={lang} 
          t={t} 
      />
      <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} t={t} />
      
    </main>
  );
}