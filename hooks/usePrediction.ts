import { useState, useCallback, useRef } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { UserData, Match, Prediction, LeaderboardEntry, GlobalPredictions, TeamData, BracketMap } from "../lib/types";

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

  // --- 1. PREDICTION SAVING LOGIC ---
  const handlePredict = useCallback(async (matchId: number, field: string, value: any) => {
    if (!user) return;
    if (!matchId) return;

    // Optimistic Update
    setPredictions((prev) => {
      const existing = prev[matchId] || { match_id: matchId, user_id: user.id };
      return { ...prev, [matchId]: { ...existing, [field]: value } };
    });

    setSaveStatus('saving');
    
    // Debounce save
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      const payload = { match_id: matchId, user_id: user.id, [field]: value };
      
      const { error } = await supabase
        .from('predictions')
        .upsert(payload, { onConflict: 'user_id, match_id' });

      if (error) {
          console.error("Save failed:", error.message);
          setSaveStatus('idle');
      } else {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
      }
    }, 500);
  }, [user, supabase, setPredictions]);

  const handleReveal = (matchId: number) => {
    if (revealCount > 0 && !revealedMatches.has(matchId)) {
       setRevealCount(prev => prev - 1);
       setRevealedMatches(prev => new Set(prev).add(matchId));
    }
  };

  // --- 2. HELPING HAND LOGIC (FIXED) ---
  // ✅ NOW ACCEPTS bracketMap to resolve dynamic knockout teams
  const handleAutoFill = (
      allTeams: TeamData[], 
      activeTab: string, 
      boostedTeams: string[] = [],
      bracketMap: BracketMap = {} 
  ) => {
      if (!user) return;

      const newPredictions = { ...predictions };
      const updates: any[] = [];
      
      // Map teams by ID for quick rank lookup
      const teamsMap = allTeams.reduce((acc, t) => { 
        acc[t.id] = t; 
        return acc; 
      }, {} as Record<string, TeamData>);

      const getStrength = (teamId: string | null) => {
          if (!teamId || !teamsMap[teamId]) return 100; // Default weak if unknown
          return teamsMap[teamId].fifa_ranking || 50; 
      };

      let targetMatches = matches;
      if (activeTab === 'KNOCKOUT') {
          targetMatches = matches.filter(m => m.stage !== 'GROUP');
      } else {
          targetMatches = matches.filter(m => m.stage === 'GROUP' && (activeTab === 'ALL' || m.home_team?.group_id === activeTab));
      }

      targetMatches.forEach(match => {
          // Skip if already predicted
          if (newPredictions[match.id]?.winner_id || (newPredictions[match.id]?.home_score !== undefined)) return;

          let homeId = match.home_team_id;
          let awayId = match.away_team_id;

          // ✅ CRITICAL FIX: Resolve ID from BracketMap if missing in DB
          if (!homeId && bracketMap[match.id]?.home) homeId = bracketMap[match.id].home;
          if (!awayId && bracketMap[match.id]?.away) awayId = bracketMap[match.id].away;

          // If we still don't know the teams (bracket incomplete), skip prediction
          if (!homeId || !awayId) return;

          let homeScore = 0;
          let awayScore = 0;
          let winnerId = null;

          const isHomeBoosted = boostedTeams.includes(homeId || '');
          const isAwayBoosted = boostedTeams.includes(awayId || '');

          if (match.stage === 'GROUP') {
             const homeStrength = getStrength(homeId);
             const awayStrength = getStrength(awayId);
             const randomFactor = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
             
             // Base Logic: Lower Rank (Better) gets higher score
             if (homeStrength < awayStrength) { 
                 homeScore = 2 + Math.max(0, randomFactor);
                 awayScore = 0 + Math.max(0, randomFactor + 1);
             } else {
                 homeScore = 0 + Math.max(0, randomFactor + 1);
                 awayScore = 2 + Math.max(0, randomFactor);
             }

             if (isHomeBoosted) homeScore += 1;
             if (isAwayBoosted) awayScore += 1;
             
             newPredictions[match.id] = { ...newPredictions[match.id], match_id: match.id, user_id: user.id, home_score: homeScore, away_score: awayScore };
             updates.push({ match_id: match.id, user_id: user.id, home_score: homeScore, away_score: awayScore });

          } else {
             // KNOCKOUT LOGIC
             const homeStr = getStrength(homeId);
             const awayStr = getStrength(awayId);
             
             // Winner Logic
             if (isHomeBoosted && !isAwayBoosted) winnerId = homeId;
             else if (isAwayBoosted && !isHomeBoosted) winnerId = awayId;
             else winnerId = homeStr < awayStr ? homeId : awayId;
             
             // In knockout, we just store the winner_id (scores are optional/cosmetic for now)
             newPredictions[match.id] = { ...newPredictions[match.id], match_id: match.id, user_id: user.id, winner_id: winnerId };
             updates.push({ match_id: match.id, user_id: user.id, winner_id: winnerId });
          }
      });

      setPredictions(newPredictions);

      if (updates.length > 0) {
          supabase.from('predictions').upsert(updates, { onConflict: 'user_id, match_id' })
            .then(({ error }) => {
              if (error) console.error("Auto-fill save error:", error);
            });
      }
  };

  return {
    handlePredict,
    handleReveal,
    revealedMatches,
    saveStatus,
    handleAutoFill
  };
}