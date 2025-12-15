import { useState } from 'react';
// ✅ FIXED: Import from the core package instead of auth-helpers
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

    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        match_id: matchId,
        user_id: user.id,
        [field]: value
      }
    }));

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

  // 2. Handle Revealing Matches
  const handleReveal = (matchId: number, rivalId?: string) => {
    if (revealCount > 0) {
        setRevealedMatches(prev => {
            const newSet = new Set(prev);
            newSet.add(matchId);
            return newSet;
        });
        setRevealCount(prev => Math.max(0, prev - 1));
    } else {
        alert("No reveals left! Earn more by making correct predictions.");
    }
  };

  // 3. Handle Auto-Fill Logic
  const handleAutoFill = async (teams: any[], activeTab: string) => {
      if (!user) return;
      
      const updates: any[] = [];
      
      // Placeholder logic matching your previous implementation
      matches.forEach(m => {
          if (m.stage === 'GROUP' && activeTab === 'A' && m.home_team?.group_id === 'A') { 
             // Logic to auto-predict scores
          }
      });
  };

  return {
    handlePredict,
    handleReveal,
    revealedMatches,
    saveStatus,
    handleAutoFill
  };
}