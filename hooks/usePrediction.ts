"use client";
import { useState } from "react";
import { Match, Prediction, LeaderboardEntry, GlobalPredictions } from "../lib/types";
import { calculateGroupStandings } from "../lib/calculator";

export function usePrediction(
    supabase: any, 
    user: any, 
    matches: Match[], 
    predictions: Record<number, Prediction>, 
    setPredictions: any,
    allPredictions: GlobalPredictions,
    revealCount: number,
    setRevealCount: any,
    leaderboard: LeaderboardEntry[]
) {
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | null>(null);
  const [revealedMatches, setRevealedMatches] = useState<Record<number, { name: string, home: number | null, away: number | null }>>({});

  const handlePredict = async (matchId: number, field: "home_score" | "away_score" | "winner_id", value: any) => {
    if (typeof value === 'number' && value < 0) return;
    
    // Optimistic Update
    const currentPred = predictions[matchId] || { match_id: matchId, home_score: null, away_score: null, is_auto: false, winner_id: null, user_id: user.id };
    const newPred = { ...currentPred, [field]: value, is_auto: false };
    
    // Auto-fix nulls for scores
    if ((field === "home_score" || field === "away_score") && newPred[field === "home_score" ? "away_score" : "home_score"] === null) {
        newPred[field === "home_score" ? "away_score" : "home_score"] = 0;
    }

    setPredictions({ ...predictions, [matchId]: newPred });

    if (user) {
        setSaveStatus("saving");
        const { error } = await supabase.from("predictions").upsert(newPred, { onConflict: "user_id, match_id" });
        if (!error) setTimeout(() => { setSaveStatus("saved"); setTimeout(() => setSaveStatus(null), 2000); }, 500);
    }
  };

  const handleReveal = async (matchId: number, targetUserId: string) => {
      if (!user || revealCount <= 0) return;
      const targetUser = leaderboard.find(u => u.user_id === targetUserId);
      const prediction = allPredictions[matchId]?.[targetUserId];

      if (prediction && prediction.home_score !== null) {
          const newCount = revealCount - 1;
          setRevealCount(newCount);
          await supabase.from('user_settings').update({ reveal_count: newCount }).eq('user_id', user.id);
          setRevealedMatches(prev => ({
              ...prev,
              [matchId]: { name: targetUser?.display_name || 'Rival', home: prediction.home_score, away: prediction.away_score }
          }));
      } else {
          alert("No prediction available to reveal.");
      }
  };

  return { handlePredict, handleReveal, revealedMatches, saveStatus };
}