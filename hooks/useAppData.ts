"use client";
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      let currentUserId: string | null = null;

      if (session?.user) {
        currentUserId = session.user.id;
        setUser({
             id: session.user.id,
             email: session.user.email || "",
             full_name: session.user.user_metadata?.full_name || "Fan"
        } as UserData);
      }

      const [ { data: matchesData }, { data: teamsData } ] = await Promise.all([
        supabase
          .from('matches')
          .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
          .order('id', { ascending: true }),
        supabase.from('teams').select('*')
      ]);

      if (matchesData) setMatches(matchesData);
      if (teamsData) setAllTeams(teamsData);

      if (currentUserId) {
        const { data: myPreds } = await supabase.from('predictions').select('*').eq('user_id', currentUserId);
        if (myPreds) {
            const predMap: Record<number, Prediction> = {};
            myPreds.forEach((p: Prediction) => {
                predMap[p.match_id] = p;
                if (p.match_id === 104) {
                    // ✅ FIXED: Ensure we don't pass undefined
                    setChampion(p.winner_id ?? null);
                }
            });
            setPredictions(predMap);
        }
      }

      const { data: allPreds } = await supabase.from('predictions').select('*');
      if (allPreds) {
          setAllPredictions({}); // Placeholder for aggregation logic
      }

      setLoading(false);
    }

    fetchInitialData();
  }, []); 

  return { user, matches, predictions, setPredictions, allPredictions, leaderboard, champion, setChampion, allTeams, revealCount, setRevealCount, loading };
}