"use client";
import { useState, useCallback } from 'react';
import { Match, Prediction, GlobalPredictions, LeaderboardEntry, UserData } from '../lib/types'; 
import { Dispatch, SetStateAction } from 'react';

type SetPredictionsType = Dispatch<SetStateAction<Record<number, Prediction>>>;

export function usePrediction(
    supabase: any,
    user: UserData | null, 
    matches: Match[],
    predictions: Record<number, Prediction>,
    setPredictions: SetPredictionsType, 
    allPredictions: GlobalPredictions,
    revealCount: number,
    setRevealCount: Dispatch<SetStateAction<number>>,
    leaderboard: LeaderboardEntry[],
    setActiveTab: (tab: string) => void
) {
    
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [revealedMatches, setRevealedMatches] = useState<Record<number, { name: string, home: number | null, away: number | null }>>({});

    const handlePredict = useCallback(async (matchId: number, field: "home_score" | "away_score" | "winner_id", value: any) => {
        // 1. Auth Check
        if (!user || !user.id) {
            alert("Please log in to predict.");
            return;
        }

        setSaveStatus('saving');

        // 2. Calculate the NEW state immediately (Don't wait for React)
        // We use the 'predictions' prop which holds the current state
        const oldPred = predictions[matchId] || { 
            match_id: matchId, 
            user_id: user.id, 
            home_score: null, 
            away_score: null, 
            winner_id: null 
        };

        // Create a clean copy to modify
        const newPred = { ...oldPred };

        // Update the specific field
        // @ts-ignore
        newPred[field] = value;

        // Smart 0-0 Logic: If one score is set, ensure the other is at least 0
        if (field === "home_score" || field === "away_score") {
             const otherField = field === "home_score" ? "away_score" : "home_score";
             if (newPred[otherField] == null) {
                 newPred[otherField] = 0;
             }
             // If scores are being set, clear any previous "winner" pick (for knockouts)
             newPred.winner_id = null;
        }

        // 3. Optimistic Update (Update UI instantly)
        setPredictions((prev) => ({
            ...prev,
            [matchId]: newPred
        }));

        // 4. Save to Database
        console.log("💾 Sending to DB:", newPred); 

        const { error } = await supabase.from('predictions').upsert([newPred]);

        if (error) {
            console.error("🔥 DB Error:", error);
            setSaveStatus('idle'); 
            // Optional: You could revert the state here if the save fails
        } else {
            console.log("✅ Saved successfully!");
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 1500); 
        }

    }, [predictions, setPredictions, user, supabase]); 

    const handleReveal = useCallback(() => {}, []);
    const handleAutoFill = useCallback(() => {}, []);

    return {
        handlePredict,
        handleReveal,
        handleAutoFill,
        revealedMatches,
        saveStatus,
    };
}