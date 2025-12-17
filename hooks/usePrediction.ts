import { useState, useCallback, useRef } from "react";
import { SupabaseClient } from "@supabase/supabase-js"; // ✅ Fixed Import
import { UserData, Match, Prediction, LeaderboardEntry, GlobalPredictions, TeamData } from "../lib/types";

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
    
    // Clear debounce
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Save to DB
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

  // --- 2. HELPING HAND LOGIC ---
  const handleAutoFill = (allTeams: TeamData[], activeTab: string) => {
      if (!user) return;

      const newPredictions = { ...predictions };
      const updates: any[] = [];
      
      // Map teams by ID for quick rank lookup
      const teamsMap = allTeams.reduce((acc, t) => { 
        acc[t.id] = t; 
        return acc; 
      }, {} as Record<string, TeamData>);

      const getStrength = (teamId: string | null) => {
          if (!teamId || !teamsMap[teamId]) return 100; 
          return teamsMap[teamId].fifa_ranking || 50; 
      };

      let targetMatches = matches;
      if (activeTab === 'KNOCKOUT') {
          targetMatches = matches.filter(m => m.stage !== 'GROUP');
      } else {
          targetMatches = matches.filter(m => m.stage === 'GROUP' && (activeTab === 'ALL' || m.home_team?.group_id === activeTab));
      }

      targetMatches.forEach(match => {
          // Only predict if empty
          if (newPredictions[match.id]) return;

          let homeScore = 0;
          let awayScore = 0;
          let winnerId = null;

          if (match.stage === 'GROUP') {
             const homeStrength = getStrength(match.home_team_id);
             const awayStrength = getStrength(match.away_team_id);
             const randomFactor = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
             
             if (homeStrength < awayStrength) { 
                 homeScore = 2 + Math.max(0, randomFactor);
                 awayScore = 0 + Math.max(0, randomFactor + 1);
             } else {
                 homeScore = 0 + Math.max(0, randomFactor + 1);
                 awayScore = 2 + Math.max(0, randomFactor);
             }
             
             newPredictions[match.id] = { ...newPredictions[match.id], match_id: match.id, user_id: user.id, home_score: homeScore, away_score: awayScore };
             updates.push({ match_id: match.id, user_id: user.id, home_score: homeScore, away_score: awayScore });

          } else if (match.home_team_id && match.away_team_id) {
             // Knockout Simple Logic
             const homeStr = getStrength(match.home_team_id);
             const awayStr = getStrength(match.away_team_id);
             winnerId = homeStr < awayStr ? match.home_team_id : match.away_team_id;
             
             homeScore = winnerId === match.home_team_id ? 1 : 0;
             awayScore = winnerId === match.away_team_id ? 1 : 0;

             newPredictions[match.id] = { ...newPredictions[match.id], match_id: match.id, user_id: user.id, home_score: homeScore, away_score: awayScore, winner_id: winnerId };
             updates.push({ match_id: match.id, user_id: user.id, home_score: homeScore, away_score: awayScore, winner_id: winnerId });
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