// hooks/useAppData.ts
"use client";
import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase'; // Adjust path if needed
import { Match, Prediction, GlobalPredictions, LeaderboardEntry, UserData, TeamData } from '../lib/types'; 

export function useAppData() {
    // --- State Declarations ---
    const [supabase] = useState(() => createClient()); // Initialize Supabase Client once
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserData | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [allTeams, setAllTeams] = useState<TeamData[]>([]);
    const [predictions, setPredictions] = useState<Record<number, Prediction>>({});
    const [allPredictions, setAllPredictions] = useState<GlobalPredictions>({});
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [champion, setChampion] = useState<string | null>(null);
    const [revealCount, setRevealCount] = useState(0);

    // --- Main Data Fetching Effect ---
    useEffect(() => {
        async function fetchInitialData() {
            setLoading(true);

            // 1. Fetch User Data and Session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            let currentUserId: string | null = null;

            if (session?.user) {
                currentUserId = session.user.id;
                
                // Fetch User Profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles') // Assuming your user data table is 'profiles'
                    .select('id, email, full_name, reveal_tokens')
                    .eq('id', currentUserId)
                    .single();

                if (profileData) {
                    setUser(profileData as UserData);
                    setRevealCount(profileData.reveal_tokens);
                } else if (profileError) {
                    console.error("Error fetching user profile:", profileError);
                }
            } else if (sessionError) {
                console.error("Session Error:", sessionError);
            }


            // 2. Fetch Static Match & Team Data
            const { data: matchData, error: matchError } = await supabase
                .from('matches')
                .select(`
                    *, 
                    home_team:home_team_id (id, name, group_id, flag_emoji),
                    away_team:away_team_id (id, name, group_id, flag_emoji)
                `)
                .order('id', { ascending: true });

            if (matchData) {
                setMatches(matchData as Match[]);
                
                // Extract unique teams (assuming match data is a reliable source)
                const teams = matchData.reduce((acc, match) => {
                    if (match.home_team && !acc.some(t => t.id === match.home_team.id)) {
                        acc.push(match.home_team);
                    }
                    if (match.away_team && !acc.some(t => t.id === match.away_team.id)) {
                        acc.push(match.away_team);
                    }
                    return acc;
                }, [] as TeamData[]);
                setAllTeams(teams);

            } else if (matchError) {
                console.error("Error fetching matches:", matchError);
            }
            

            // 3. Fetch all Predictions (for user and global)
            const { data: allPreds, error: allPredError } = await supabase
                .from('predictions')
                .select(`*, user:user_id (id, full_name)`);

            if (allPreds) {
                const globalPredMap: GlobalPredictions = {};
                const userPredMap: Record<number, Prediction> = {};

                allPreds.forEach((p: any) => {
                    const userId = p.user_id;
                    const userName = p.user?.full_name || 'Anonymous';
                    
                    // CRITICAL FIX: Initialize the inner object with the required structure
                    if (!globalPredMap[userId]) {
                        globalPredMap[userId] = { 
                            full_name: userName, 
                            predictions: {} 
                        };
                    }
                    
                    // Add prediction to the user's map inside globalPredMap
                    globalPredMap[userId].predictions[p.match_id] = p as Prediction;
                    
                    // If this is the current user, populate userPredMap
                    if (userId === currentUserId) {
                        userPredMap[p.match_id] = p as Prediction;
                    }
                });
                
                setPredictions(userPredMap);
                setAllPredictions(globalPredMap);
            } else if (allPredError) {
                console.error("Error fetching predictions:", allPredError);
            }
            
            // 4. Fetch Leaderboard (Assuming this is a view or function in Supabase)
            const { data: leaderboardData, error: leaderboardError } = await supabase
                .from('leaderboard_view') // Adjust table name if necessary
                .select('*')
                .order('rank', { ascending: true });

            if (leaderboardData) {
                setLeaderboard(leaderboardData as LeaderboardEntry[]);
            } else if (leaderboardError) {
                console.error("Error fetching leaderboard:", leaderboardError);
            }


            setLoading(false);
        }

        fetchInitialData();
    }, [supabase]); 

    // --- Return Values ---
    return {
        supabase,
        user,
        matches,
        setMatches, // Included, but likely not used outside the hook
        predictions,
        setPredictions,
        allPredictions,
        leaderboard,
        champion,
        setChampion,
        allTeams,
        revealCount,
        setRevealCount,
        loading,
    };
}