// hooks/usePrediction.ts
"use client";
import { useState, useCallback, useMemo } from 'react';
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
    // 🔥 FIX: Use Dispatch<SetStateAction<number>> for setRevealCount for robust typing
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

    // 3a. Prediction Handler (Score and Winner)
    const handlePredict = useCallback(async (matchId: number, field: "home_score" | "away_score" | "winner_id", value: any) => {
        setSaveStatus('saving');

        const newPrediction = {
            match_id: matchId,
            user_id: currentUserId,
            home_score: predictions[matchId]?.home_score ?? null,
            away_score: predictions[matchId]?.away_score ?? null,
            winner_id: predictions[matchId]?.winner_id ?? null,
            [field]: value
        };

        setPredictions((prev: Record<number, Prediction>) => ({
            ...prev,
            [matchId]: newPrediction
        }));

        const { error } = await supabase.from('predictions').upsert([newPrediction]);

        if (error) {
            console.error("Prediction Save Error:", error);
            setSaveStatus('idle'); 
        } else {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 1500); 
        }

    }, [predictions, setPredictions, currentUserId, supabase]);


    // 3b. Reveal Rival Handler (Placeholder)
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

        // 🔥 FIX 1: Explicitly type 'prev' as number
        setRevealCount((prev: number) => prev - 1);
        
        // 🔥 FIX 2: Explicitly type 'l' as LeaderboardEntry to fix l.user_id error
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


    // 3c. AutoFill Simulation Handler
    const handleAutoFill = useCallback(async (boostedTeams: string[], currentActiveTab: string) => {
        
        const existingGroupPredictions = Object.values(predictions || {}).filter(p => p.match_id <= 72);

        if (existingGroupPredictions.length > 0) {
            alert("Cannot auto-fill! Please clear existing Group Stage predictions first.");
            return;
        }
        
        setSaveStatus('saving');
        const newPredictionsArray: Prediction[] = [];
        const matchesToPredict = matches.filter(m => m.stage === 'GROUP'); 
        
        // SIMULATION LOGIC
        matchesToPredict.forEach(m => {
            const homeId = m.home_team_id || '';
            const awayId = m.away_team_id || '';
            
            let homeScore = 0;
            let awayScore = 0;
            const isHomeBoosted = boostedTeams.includes(homeId);
            const isAwayBoosted = boostedTeams.includes(awayId);

            if (isHomeBoosted && !isAwayBoosted) {
                homeScore = Math.floor(Math.random() * 2) + 2; 
                awayScore = Math.floor(Math.random() * 2);     
            } else if (isAwayBoosted && !isHomeBoosted) {
                awayScore = Math.floor(Math.random() * 2) + 2;
                homeScore = Math.floor(Math.random() * 2);
            } else {
                homeScore = Math.floor(Math.random() * 3);
                awayScore = Math.floor(Math.random() * 3);
            }

            newPredictionsArray.push({
                match_id: m.id,
                user_id: currentUserId,
                home_score: homeScore,
                away_score: awayScore,
                winner_id: null,
            });
        });

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