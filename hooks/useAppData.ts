"use client";
import { useState, useEffect } from 'react';
// ✅ IMPORT THE SHARED SINGLETON (Fixes "No Session" / RLS Error)
import { supabase } from '../lib/supabase';
import { Match, Prediction, GlobalPredictions, LeaderboardEntry, UserData, TeamData } from '../lib/types';

export function useAppData() {
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
      const { data: { session } } = await supabase.auth.getSession();
      let currentUserId: string | null = null;

      if (session?.user) {
        currentUserId = session.user.id;
        
        // ✅ FIX TYPESCRIPT ERROR: Cast as UserData to satisfy the compiler
        setUser({
             id: session.user.id,
             email: session.user.email || "",
             full_name: session.user.user_metadata?.full_name || "Fan"
        } as UserData);
      }

      // 2. Parallel Fetching for Static Data
      const [
        { data: matchesData },
        { data: teamsData }
      ] = await Promise.all([
        supabase.from('matches').select('*').order('id', { ascending: true }),
        supabase.from('teams').select('*')
      ]);

      if (matchesData) setMatches(matchesData);
      if (teamsData) setAllTeams(teamsData);

      // 3. Fetch Predictions (If logged in)
      if (currentUserId) {
        const { data: myPreds } = await supabase
            .from('predictions')
            .select('*')
            .eq('user_id', currentUserId);

        if (myPreds) {
            const predMap: Record<number, Prediction> = {};
            myPreds.forEach((p: Prediction) => {
                predMap[p.match_id] = p;
                if (p.match_id === 64) setChampion(p.winner_id); 
            });
            setPredictions(predMap);
        }
      }

      // 4. Fetch Global Predictions (Optional / Placeholder)
      const { data: allPreds } = await supabase.from('predictions').select('*');
      if (allPreds) {
          const globPreds: GlobalPredictions = {};
          // Basic aggregation logic can go here
          setAllPredictions(globPreds);
      }

      setLoading(false);
    }

    fetchInitialData();
  }, []); 

  return {
    user,
    matches,
    predictions,
    setPredictions,
    allPredictions,
    leaderboard,
    champion,
    setChampion,
    allTeams,
    revealCount,
    setRevealCount,
    loading
  };
}