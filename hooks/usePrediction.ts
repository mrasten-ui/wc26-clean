"use client";
import { useState, useCallback } from 'react';
import { Match, Prediction, GlobalPredictions, LeaderboardEntry, UserData } from '../lib/types'; 
import { Dispatch, SetStateAction } from 'react';

type SetPredictionsType = Dispatch<SetStateAction<Record<number, Prediction>>>;

// --- HELPER: The Prediction Algorithm ---
const calculateScore = (
    myRank: number, 
    opponentRank: number, 
    isMyTeamBoosted: boolean, 
    isOpponentBoosted: boolean,
    isHome: boolean
) => {
    let lambda = 1.3;
    const rankDiff = opponentRank - myRank; 
    lambda += (rankDiff / 40);
    if (isHome) lambda += 0.15;
    if (isMyTeamBoosted) lambda += 1.2; 
    if (isOpponentBoosted) lambda -= 0.5; 
    if (lambda < 0.2) lambda = 0.2; 
    
    const random = Math.random();
    let score = 0;
    if (random > 0.95) score = Math.floor(lambda + 2); 
    else if (random > 0.6) score = Math.round(lambda + 0.5);
    else score = Math.round(lambda);

    return Math.max(0, score);
};

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

        const { error } = await supabase.from('predictions').upsert([newPred], { onConflict: 'user_id, match_id' });

        if (error) {
            console.error("🔥 DB Error:", error);
            setSaveStatus('idle'); 
        } else {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 1500); 
        }

    }, [predictions, setPredictions, user, supabase]); 

    // 2. REVEAL RIVAL
    const handleReveal = useCallback((matchId: number, rivalId: string) => {
        console.log("Reveal feature coming soon", matchId, rivalId);
    }, []);

    // 3. AUTO-FILL / HELPING HAND
    const handleAutoFill = useCallback(async (boostedTeams: string[], currentTab: string) => {
        if (!user || !user.id) {
            alert("Please log in to use the Helping Hand.");
            return;
        }

        const isGroupMode = currentTab === "GROUPS" || (currentTab.length === 1 && currentTab.match(/[A-L]/));

        if (isGroupMode) {
            // ✅ Removed confirm() dialog per request
            setSaveStatus('saving');
            
            const groupMatches = matches.filter(m => m.stage === 'GROUP' && m.home_team && m.away_team);
            const newPredictions: Prediction[] = [];
            const newPredictionsMap: Record<number, Prediction> = {};

            groupMatches.forEach(m => {
                const homeId = m.home_team!.id;
                const awayId = m.away_team!.id;
                const homeRank = m.home_team!.fifa_ranking || 50;
                const awayRank = m.away_team!.fifa_ranking || 50;

                const isHomeBoosted = boostedTeams.includes(homeId);
                const isAwayBoosted = boostedTeams.includes(awayId);

                const hScore = calculateScore(homeRank, awayRank, isHomeBoosted, isAwayBoosted, true);
                const aScore = calculateScore(awayRank, homeRank, isAwayBoosted, isHomeBoosted, false);

                const predObj: Prediction = {
                    match_id: m.id,
                    user_id: user.id,
                    home_score: hScore,
                    away_score: aScore,
                    winner_id: null
                };

                newPredictions.push(predObj);
                newPredictionsMap[m.id] = predObj;
            });

            setPredictions(prev => ({ ...prev, ...newPredictionsMap }));

            // ✅ ADDED: { onConflict: 'user_id, match_id' } to fix the save error
            const { error } = await supabase.from('predictions').upsert(newPredictions, { onConflict: 'user_id, match_id' });

            if (error) {
                console.error("AutoFill Failed:", error);
                setSaveStatus('idle');
                alert("Error saving simulation. Please try again.");
            } else {
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            }
        } else {
            alert("Knockout AutoFill coming in the next step!");
        }

    }, [matches, user, supabase, setPredictions]);

    return {
        handlePredict,
        handleReveal,
        handleAutoFill,
        revealedMatches,
        saveStatus,
    };
}