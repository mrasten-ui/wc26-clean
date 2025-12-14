"use client";
import { useState, useCallback } from 'react';
import { Match, Prediction, GlobalPredictions, LeaderboardEntry, UserData } from '../lib/types'; 
import { Dispatch, SetStateAction } from 'react';
import { generateGroupPredictions } from '../lib/simulation'; 

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

    // 1. MANUAL PREDICTION
    const handlePredict = useCallback(async (matchId: number, field: "home_score" | "away_score" | "winner_id", value: any) => {
        if (!user || !user.id) {
            alert("Please log in to predict.");
            return;
        }

        setSaveStatus('saving');

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

        if (field === "home_score" || field === "away_score") {
             const otherField = field === "home_score" ? "away_score" : "home_score";
             if (newPred[otherField] == null) newPred[otherField] = 0;
             newPred.winner_id = null;
        }

        setPredictions((prev) => ({ ...prev, [matchId]: newPred }));

        // Upsert single prediction
        const { error } = await supabase.from('predictions').upsert([newPred], { onConflict: 'user_id, match_id' });

        if (error) {
            console.error("Single Save Error:", error);
            setSaveStatus('idle'); 
        } else {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 1500); 
        }

    }, [predictions, setPredictions, user, supabase]); 

    // 2. AUTO-FILL / HELPING HAND
    const handleAutoFill = useCallback(async (boostedTeams: string[], currentTab: string) => {
        if (!user || !user.id) {
            alert("Please log in.");
            return;
        }

        const isGroupMode = currentTab === "GROUPS" || (currentTab.length === 1 && currentTab.match(/[A-L]/));

        if (isGroupMode) {
            setSaveStatus('saving');
            
            // Use logic from simulation.ts
            const newPredictionsArray = generateGroupPredictions(matches, user.id, boostedTeams);
            
            const newPredictionsMap: Record<number, Prediction> = {};
            newPredictionsArray.forEach(p => { newPredictionsMap[p.match_id] = p; });

            setPredictions(prev => ({ ...prev, ...newPredictionsMap }));

            // Bulk Save
            const { error } = await supabase.from('predictions').upsert(newPredictionsArray, { onConflict: 'user_id, match_id' });

            if (error) {
                console.error("AutoFill Failed:", error);
                setSaveStatus('idle');
                // 🔥 SHOW THE REAL ERROR MESSAGE ON SCREEN
                alert(`Save Failed: ${error.message || JSON.stringify(error)}`);
            } else {
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            }
        } else {
            alert("Knockout AutoFill coming soon!");
        }

    }, [matches, user, supabase, setPredictions]);

    const handleReveal = useCallback((matchId: number, rivalId: string) => {
        console.log("Reveal", matchId, rivalId);
    }, []);

    return {
        handlePredict,
        handleReveal,
        handleAutoFill,
        revealedMatches,
        saveStatus,
    };
}