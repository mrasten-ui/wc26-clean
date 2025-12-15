import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserData, Match, Prediction, LeaderboardEntry, GlobalPredictions } from '../lib/types';
import { generateGroupPredictions } from '../lib/simulation';

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
      
      // CRITICAL FIX: Ensure both scores exist as null (not undefined) if missing,
      // and apply the specific field update last.
      const mergedPrediction = {
        ...existing, 
        
        match_id: matchId,
        user_id: user.id,
        // Ensure home/away scores are never undefined when saving state
        home_score: existing.home_score ?? null, 
        away_score: existing.away_score ?? null, 
        winner_id: existing.winner_id ?? null,
        
        [field]: value // Apply the specific update
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
      console.error('Error saving prediction:', error);
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

  // 3. Handle Auto-Fill Logic (Global Scope)
  const handleAutoFill = async (boostedTeams: string[], activeTab: string) => {
      if (!user) return;
      
      let matchesToFill: Match[] = [];
      
      // Determine the scope: Group Stage or Knockout
      if (activeTab === 'KNOCKOUT' || activeTab === 'BRACKET' || ['R32', 'R16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL'].includes(activeTab)) {
          // Fill ALL knockout matches
          matchesToFill = matches.filter(m => m.stage !== 'GROUP');
      } else {
          // Assume Group tabs (A-L) mean 'fill the whole Group Stage'
          matchesToFill = matches.filter(m => m.stage === 'GROUP');
      }

      if (matchesToFill.length === 0) return;

      // 1. Generate scores/winners locally (Group predictions are sufficient for both stages for now)
      const newPreds = generateGroupPredictions(matchesToFill, user.id, boostedTeams); 
      
      // 2. Update Local State
      setPredictions(prev => {
          const next = { ...prev };
          newPreds.forEach(p => {
              // Merge the new prediction with any existing data
              next[p.match_id] = { 
                  ...next[p.match_id], 
                  ...p,
                  // Ensure fields are explicitly set to null if missing in the new prediction
                  home_score: p.home_score ?? null, 
                  away_score: p.away_score ?? null,
                  winner_id: p.winner_id ?? null,
              };
          });
          return next;
      });

      // 3. Save to Database (Bulk)
      const { error } = await supabase
          .from('predictions')
          .upsert(newPreds, { onConflict: 'match_id,user_id' });

      if (error) console.error("Auto-fill save error", error);
  };

  return { handlePredict, handleReveal, revealedMatches, saveStatus, handleAutoFill };
}