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
    
    // ✅ HOOKS MUST ALWAYS RUN AT THE TOP LEVEL
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [revealedMatches, setRevealedMatches] = useState<Record<number, { name: string, home: number | null, away: number | null }>>({});

    const handlePredict = useCallback(async (matchId: number, field: "home_score" | "away_score" | "winner_id", value: any) => {
        // ✅ MOVED THE CHECK INSIDE THE FUNCTION
        if (!user || !user.id) {
            alert("Please log in to predict.");
            return;
        }

        setSaveStatus('saving');

        // Optimistically update the UI
        const oldPred = predictions[matchId] || { 
            match_id: matchId, 
            user_id: user.id, 
            home_score: null, 
            away_score: null, 
            winner_id: null 
        };

        const newPred = { ...oldPred };
        // @ts-ignore
        newPred[field] = value;

        // Smart 0-0 Logic
        if (field === "home_score" || field === "away_score") {
             const otherField = field === "home_score" ? "away_score" : "home_score";
             if (newPred[otherField] == null) {
                 newPred[otherField] = 0;
             }
             newPred.winner_id = null;
        }

        setPredictions((prev) => ({
            ...prev,
            [matchId]: newPred
        }));

        console.log("💾 Sending to DB:", newPred); 

        const { error } = await supabase.from('predictions').upsert([newPred]);

        if (error) {
            console.error("🔥 DB Error:", error);
            setSaveStatus('idle'); 
        } else {
            console.log("✅ Saved successfully!");
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 1500); 
        }

    }, [predictions, setPredictions, user, supabase]); 

    // ✅ FIXED: Added arguments to satisfy TypeScript build
    const handleReveal = useCallback((matchId: number, rivalId: string) => {
        console.log("Reveal feature coming soon", matchId, rivalId);
    }, []);

    const handleAutoFill = useCallback((teams: string[], tab: string) => {
        console.log("AutoFill feature coming soon", teams, tab);
    }, []);

    return {
        handlePredict,
        handleReveal,
        handleAutoFill,
        revealedMatches,
        saveStatus,
    };
}