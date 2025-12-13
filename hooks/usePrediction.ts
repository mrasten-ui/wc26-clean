// hooks/usePrediction.ts
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

    if (!user || !user.id) {
         return {
            handlePredict: () => {},
            handleReveal: () => {},
            handleAutoFill: () => {},
            revealedMatches: {},
            saveStatus: 'idle' as const,
        };
    }
    
    const currentUserId = user.id;

    // 3a. Prediction Handler (Score and Winner) - Now includes smart 0-0 logic
    const handlePredict = useCallback(async (matchId: number, field: "home_score" | "away_score" | "winner_id", value: any) => {
        setSaveStatus('saving');

        let finalPredictionForDb: Prediction;

        // 🔥 CRITICAL FIX: Use the state updater function for state management and smart 0-0 logic
        setPredictions((prev: Record<number, Prediction>) => {
             // 1. Start with a shallow copy of the state
             const newState = { ...prev }; 
             
             // 2. Get the current or initial prediction for this match
             const current = newState[matchId] || { match_id: matchId, user_id: currentUserId, home_score: null, away_score: null, winner_id: null };

             // 3. Apply the new value
             current[field] = value;

             // 4. Implement the SMART 0-0 logic (only if scores are involved)
             if (field === "home_score" || field === "away_score") {
                 const otherField = field === "home_score" ? "away_score" : "home_score";
                 
                 // If the OTHER score is null/undefined, set it to 0 for a valid 0-0 prediction
                 if (current[otherField] == null) {
                    current[otherField] = 0;
                 }
                 
                 // If a score is being set, clear the winner_id (in case it was set manually)
                 current.winner_id = null;
             }

             // 5. Update the state map
             newState[matchId] = current as Prediction;
             
             // Save the final object used for the DB (outside the function)
             finalPredictionForDb = current as Prediction;
             
             // 6. Return the new object reference to trigger re-render
             return newState;
        });

        // 7. Send the final object to the database
        // We use the temporary variable captured from the setter function above
        const { error } = await supabase.from('predictions').upsert([finalPredictionForDb!]);

        if (error) {
            console.error("Prediction Save Error:", error);
            setSaveStatus('idle'); 
        } else {
            setSaveStatus('saved');
            // This timeout handles the disappearance of the 'Saved' badge
            setTimeout(() => setSaveStatus('idle'), 1500); 
        }

    }, [setPredictions, currentUserId, supabase]); 


    // 3b. Reveal Rival Handler (omitted for brevity)
    const handleReveal = useCallback((matchId: number, rivalId: string) => {
        
        if (revealCount <= 0) {
            alert("No tokens remaining!");
            return;
        }

        const rivalPrediction = allPredictions[rivalId]?.predictions[matchId];
        if (!rivalPrediction) {
            alert("Rival has not predicted this match yet.");
            return;
        }

        setRevealCount((prev: number) => prev - 1);
        
        const rivalEntry = leaderboard.find((l: LeaderboardEntry) => l.user_id === rivalId);
        const rivalName = rivalEntry?.full_name || rivalId;

        setRevealedMatches(prev => ({
            ...prev,
            [matchId]: {
                name: rivalName,
                home: rivalPrediction.home_score,
                away: rivalPrediction.away_score,
            }
        }));

    }, [revealCount, setRevealCount, allPredictions, leaderboard]);


    // 3c. AutoFill Simulation Handler (omitted for brevity)
    const handleAutoFill = useCallback(async (boostedTeams: string[], currentActiveTab: string) => {
        
        const existingGroupPredictions = Object.values(predictions || {}).filter(p => p.match_id <= 72);

        if (existingGroupPredictions.length > 0) {
            alert("Cannot auto-fill! Please clear existing Group Stage predictions first.");
            return;
        }
        
        setSaveStatus('saving');
        const newPredictionsArray: Prediction[] = [];
        const matchesToPredict = matches.filter(m => m.stage === 'GROUP'); 
        
        // SIMULATION LOGIC (omitted)

        // Commit and Save
        const predictionsMap = newPredictionsArray.reduce((acc, p) => { acc[p.match_id] = p; return acc; }, {} as Record<number, Prediction>);
        
        setPredictions((prev: Record<number, Prediction>) => ({ ...prev, ...predictionsMap }));
        
        const { error } = await supabase.from('predictions').upsert(newPredictionsArray);
        
        if (error) {
             console.error("Auto-fill Save Error:", error);
             setSaveStatus('idle');
        } else {
            alert(`Simulation complete! ${newPredictionsArray.length} predictions added.`);
            setSaveStatus('saved');
            setActiveTab(currentActiveTab); 
            setTimeout(() => setSaveStatus('idle'), 1500);
        }

    }, [predictions, setPredictions, currentUserId, matches, supabase, setActiveTab]);


    // --- 4. FINAL RETURN ---
    return {
        handlePredict,
        handleReveal,
        handleAutoFill,
        revealedMatches,
        saveStatus,
    };
}