"use client";
import { useState, useCallback } from 'react';
import { Match, Prediction, GlobalPredictions, LeaderboardEntry, UserData } from '../lib/types'; 
import { Dispatch, SetStateAction } from 'react';
import { generateGroupPredictions } from '../lib/simulation'; // ✅ Imported Logic

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

        // Smart 0-0 Logic
        if (field === "home_score" || field === "away_score") {
             const otherField = field === "home_score" ? "away_score" : "home_score";
             if (newPred[otherField] == null) newPred[otherField] = 0;
             newPred.winner_id = null;
        }

        // Optimistic Update
        setPredictions((prev) => ({ ...prev, [matchId]: newPred }));

        // Database Update
        // ✅ The onConflict here MUST match the unique constraint we just added in SQL
        const { error } = await supabase.from('predictions').upsert([newPred], { onConflict: 'user_id, match_id' });

        if (error) {
            console.error("🔥 DB Error:", error);
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
            
            // ✅ Use the separated logic
            const newPredictionsArray = generateGroupPredictions(matches, user.id, boostedTeams);
            
            // Convert array to map for state update
            const newPredictionsMap: Record<number, Prediction> = {};
            newPredictionsArray.forEach(p => { newPredictionsMap[p.match_id] = p; });

            // Optimistic UI Update
            setPredictions(prev => ({ ...prev, ...newPredictionsMap }));

            // Bulk Save
            const { error } = await supabase.from('predictions').upsert(newPredictionsArray, { onConflict: 'user_id, match_id' });

            if (error) {
                console.error("AutoFill Failed:", error);
                setSaveStatus('idle');
                alert("Error saving simulation. Please try again.");
            } else {
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            }
        } else {
            alert("Knockout AutoFill coming soon!");
        }

    }, [matches, user, supabase, setPredictions]);

    // 3. REVEAL (Placeholder)
    const handleReveal = useCallback((matchId: number, rivalId: string) => {
        console.log("Reveal feature coming soon", matchId, rivalId);
    }, []);

    return {
        handlePredict,
        handleReveal,
        handleAutoFill,
        revealedMatches,
        saveStatus,
    };
}