import { useState } from 'react';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';
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

    // Debounce or immediate save could go here. For now, simple direct save:
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
      setSaveStatus('idle'); // Or error state
    } else {
      setSaveStatus('saved');
    }
  };

  // 2. Handle Revealing Matches
  // ✅ FIXED: Added '?' to make rivalId optional. 
  // This allows GroupStage (which sends 1 arg) AND MatchCenter (which might send 2) to both work.
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
      
      // Basic random logic for demo purposes
      // In a real app, you might use FIFA rankings here
      const updates: any[] = [];
      
      matches.forEach(m => {
          if (m.stage === 'GROUP' && activeTab === 'A' && m.home_team?.group_id === 'A') { // Example filter
             // Logic to auto-predict scores
          }
      });
      
      // This is a placeholder for the logic we discussed earlier.
      // Ensure this matches your AutoFillModal implementation.
  };

  return {
    handlePredict,
    handleReveal,
    revealedMatches,
    saveStatus,
    handleAutoFill
  };
}