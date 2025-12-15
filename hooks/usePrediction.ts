import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserData, Match, Prediction, LeaderboardEntry, GlobalPredictions } from '../lib/types';

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
      
      // ✅ CRITICAL FIX: Ensure both scores exist as null (not undefined) if missing
      const mergedPrediction = {
        match_id: matchId,
        user_id: user.id,
        home_score: existing.home_score ?? null, 
        away_score: existing.away_score ?? null, 
        winner_id: existing.winner_id ?? null,
        ...existing, // Spread existing properties
        [field]: value // Overwrite the specific field being changed
      };

      return {
        ...prev,
        [matchId]: mergedPrediction
      };
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

  const handleAutoFill = async (teams: any[], activeTab: string) => {
      // Placeholder
  };

  return { handlePredict, handleReveal, revealedMatches, saveStatus, handleAutoFill };
}