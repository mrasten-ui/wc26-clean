import { useState, useCallback, useRef } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { UserData, Match, Prediction, LeaderboardEntry, GlobalPredictions, TeamData, BracketMap } from "../lib/types";
// ✅ IMPORT MATCHING THE EXPORT
import { BRACKET_STRUCTURE } from "../lib/bracket";

export function usePrediction(
  supabase: SupabaseClient,
  user: UserData | null,
  matches: Match[],
  predictions: Record<number, Prediction>,
  setPredictions: React.Dispatch<React.SetStateAction<Record<number, Prediction>>>,
  allPredictions: GlobalPredictions,
  revealCount: number,
  setRevealCount: React.Dispatch<React.SetStateAction<number>>,
  leaderboard: LeaderboardEntry[],
  setActiveTab: (tab: string) => void
) {
  const [revealedMatches, setRevealedMatches] = useState<Set<number>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePredict = useCallback(async (matchId: number, field: string, value: any) => {
    if (!user) return;
    if (!matchId) return;

    setPredictions((prev) => {
      const existing = prev[matchId] || { match_id: matchId, user_id: user.id };
      return { ...prev, [matchId]: { ...existing, [field]: value } };
    });

    setSaveStatus('saving');
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      const payload = { match_id: matchId, user_id: user.id, [field]: value };
      const { error } = await supabase.from('predictions').upsert(payload, { onConflict: 'user_id, match_id' });
      if (error) { console.error("Save failed:", error); setSaveStatus('idle'); } 
      else { setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000); }
    }, 500);
  }, [user, supabase, setPredictions]);

  const handleReveal = (matchId: number) => {
    if (revealCount > 0 && !revealedMatches.has(matchId)) {
       setRevealCount(prev => prev - 1);
       setRevealedMatches(prev => new Set(prev).add(matchId));
    }
  };

  const handleClear = async (targetScope: 'ALL_GROUPS' | 'KNOCKOUT') => {
      if (!user) return;
      let targetMatches: Match[] = [];
      if (targetScope === 'ALL_GROUPS') targetMatches = matches.filter(m => m.stage === 'GROUP');
      else if (targetScope === 'KNOCKOUT') targetMatches = matches.filter(m => m.stage !== 'GROUP');
      
      if (targetMatches.length === 0) return;
      const matchIds = targetMatches.map(m => m.id);

      setPredictions(prev => {
          const next = { ...prev };
          matchIds.forEach(id => delete next[id]);
          return next;
      });

      await supabase.from('predictions').delete().eq('user_id', user.id).in('match_id', matchIds);
  };

  const handleAutoFill = (
      allTeams: TeamData[], 
      targetScope: 'ALL_GROUPS' | 'KNOCKOUT', 
      boostedTeams: string[] = [],
      initialBracketMap: BracketMap = {} 
  ) => {
      if (!user) return;

      const newPredictions = { ...predictions };
      const updates: any[] = [];
      const teamsMap = allTeams.reduce((acc, t) => { acc[t.id] = t; return acc; }, {} as Record<string, TeamData>);
      const runningBracketMap = JSON.parse(JSON.stringify(initialBracketMap));

      const getStrength = (teamId: string | null) => {
          if (!teamId || !teamsMap[teamId]) return 100; 
          return teamsMap[teamId].fifa_ranking || 50; 
      };

      let targetMatches: Match[] = [];
      if (targetScope === 'KNOCKOUT') targetMatches = matches.filter(m => m.stage !== 'GROUP');
      else targetMatches = matches.filter(m => m.stage === 'GROUP');

      targetMatches.sort((a, b) => a.id - b.id);

      targetMatches.forEach(match => {
          let homeId = match.home_team_id;
          let awayId = match.away_team_id;

          if (match.stage !== 'GROUP') {
             if (!homeId && runningBracketMap[match.id]?.home) homeId = runningBracketMap[match.id].home;
             if (!awayId && runningBracketMap[match.id]?.away) awayId = runningBracketMap[match.id].away;
          }

          if (!homeId || !awayId) return;

          let homeScore = 0;
          let awayScore = 0;
          let winnerId: string | null = null;

          const isHomeBoosted = boostedTeams.includes(homeId);
          const isAwayBoosted = boostedTeams.includes(awayId);

          if (match.stage === 'GROUP') {
             const homeStrength = getStrength(homeId);
             const awayStrength = getStrength(awayId);
             const randomFactor = Math.floor(Math.random() * 3) - 1; 
             if (homeStrength < awayStrength) { homeScore = 2 + Math.max(0, randomFactor); awayScore = 0 + Math.max(0, randomFactor + 1); } 
             else { homeScore = 0 + Math.max(0, randomFactor + 1); awayScore = 2 + Math.max(0, randomFactor); }
             if (isHomeBoosted) homeScore += 1;
             if (isAwayBoosted) awayScore += 1;
             
             newPredictions[match.id] = { ...newPredictions[match.id], match_id: match.id, user_id: user.id, home_score: homeScore, away_score: awayScore };
             updates.push({ match_id: match.id, user_id: user.id, home_score: homeScore, away_score: awayScore });

          } else {
             const homeStr = getStrength(homeId);
             const awayStr = getStrength(awayId);
             
             if (isHomeBoosted && !isAwayBoosted) winnerId = homeId;
             else if (isAwayBoosted && !isHomeBoosted) winnerId = awayId;
             else winnerId = homeStr < awayStr ? homeId : awayId;
             
             newPredictions[match.id] = { ...newPredictions[match.id], match_id: match.id, user_id: user.id, winner_id: winnerId };
             updates.push({ match_id: match.id, user_id: user.id, winner_id: winnerId });

             const winCode = `W${match.id}`;
             if (BRACKET_STRUCTURE) {
                 Object.entries(BRACKET_STRUCTURE).forEach(([futureMatchIdStr, config]) => {
                     const futureMatchId = parseInt(futureMatchIdStr);
                     if (futureMatchId > match.id) {
                         if (config.home === winCode) {
                             if (!runningBracketMap[futureMatchId]) runningBracketMap[futureMatchId] = { home: null, away: null };
                             runningBracketMap[futureMatchId].home = winnerId;
                         }
                         if (config.away === winCode) {
                             if (!runningBracketMap[futureMatchId]) runningBracketMap[futureMatchId] = { home: null, away: null };
                             runningBracketMap[futureMatchId].away = winnerId;
                         }
                     }
                 });
             }
          }
      });

      setPredictions(newPredictions);

      if (updates.length > 0) {
          supabase.from('predictions').upsert(updates, { onConflict: 'user_id, match_id' }).then(({ error }) => {
              if (error) console.error("Auto-fill save error:", error);
          });
      }
  };

  return { handlePredict, handleReveal, revealedMatches, saveStatus, handleAutoFill, handleClear };
}