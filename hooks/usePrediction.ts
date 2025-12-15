import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserData, Match, Prediction, LeaderboardEntry, GlobalPredictions } from '../lib/types';
import { generateGroupPredictions } from '../lib/simulation'; // ✅ Import this

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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [revealedMatches, setRevealedMatches] = useState<Set<number>>(new Set());

  // 1. Handle Saving Predictions
  const handlePredict = async (matchId: number, field: string, value: any) => {
    if (!user) return;

    setPredictions((prev) => {
      const existing = prev[matchId] || {};
      
      // ✅ FIXED: Spread 'existing' FIRST to avoid build error
      const mergedPrediction = {
        ...existing, 
        
        match_id: matchId,
        user_id: user.id,
        home_score: existing.home_score ?? null, 
        away_score: existing.away_score ?? null, 
        winner_id: existing.winner_id ?? null,
        
        [field]: value // Apply update last
      };

      return { ...prev, [matchId]: mergedPrediction };
    });

    setSaveStatus('saving');

    const { error } = await supabase
      .from('predictions')
      .upsert({
        match_id: matchId,
        user_id: user.id,
        [field]: value,
        updated_at: new Date().toISOString()
      }, { onConflict: 'match_id,user_id' });

    if (error) {
      console.error('Error saving:', error);
      setSaveStatus('idle'); 
    } else {
      setSaveStatus('saved');
    }
  };

  const handleReveal = (matchId: number, rivalId?: string) => {
    if (revealCount > 0) {
        setRevealedMatches(prev => {
            const newSet = new Set(prev);
            newSet.add(matchId);
            return newSet;
        });
        setRevealCount(prev => Math.max(0, prev - 1));
    } else {
        alert("No reveals left!");
    }
  };

  // ✅ FIXED: Real Auto-Fill Logic
  const handleAutoFill = async (boostedTeams: string[], activeTab: string) => {
      if (!user) return;
      
      // 1. Generate scores locally
      const newPreds = generateGroupPredictions(matches, user.id, boostedTeams);
      
      // 2. Filter for current tab only (e.g., only Group A if activeTab is 'A')
      // If activeTab is 'KNOCKOUT' or 'ALL', we might want different logic.
      // For now, let's assume we fill ONLY the active group.
      const filteredPreds = newPreds.filter(p => {
         const m = matches.find(match => match.id === p.match_id);
         return m?.home_team?.group_id === activeTab;
      });

      if (filteredPreds.length === 0) return;

      // 3. Update Local State
      setPredictions(prev => {
          const next = { ...prev };
          filteredPreds.forEach(p => {
              next[p.match_id] = { ...next[p.match_id], ...p };
          });
          return next;
      });

      // 4. Save to Database (Bulk)
      const { error } = await supabase
          .from('predictions')
          .upsert(filteredPreds, { onConflict: 'match_id,user_id' });

      if (error) console.error("Auto-fill save error", error);
  };

  return { handlePredict, handleReveal, revealedMatches, saveStatus, handleAutoFill };
}