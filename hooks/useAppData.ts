"use client";
import { useState, useEffect } from "react";
import { createClient } from "../lib/supabase";
import { Match, Prediction, LeaderboardEntry, GlobalPredictions } from "../lib/types";
import { useRouter } from "next/navigation";

export function useAppData() {
  const [user, setUser] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({});
  const [allPredictions, setAllPredictions] = useState<GlobalPredictions>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [champion, setChampion] = useState<string | null>(null);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [revealCount, setRevealCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (!supabaseUser) { router.push("/login"); return; }
      
      const displayName = supabaseUser?.user_metadata?.full_name || supabaseUser?.email?.split('@')[0] || 'Player';
      setUser({ ...supabaseUser, displayName });

      // Load Settings
      const { data: settings } = await supabase.from('user_settings').select('reveal_count').eq('user_id', supabaseUser.id).single();
      if (!settings) await supabase.from('user_settings').insert({ user_id: supabaseUser.id, reveal_count: 5 });
      else setRevealCount(settings.reveal_count);

      // Load All Data in Parallel
      const [matchRes, allPredRes, bonusRes, teamsRes, lbRes] = await Promise.all([
          supabase.from("matches").select(`*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)`).order("id"),
          supabase.from("predictions").select("*"),
          supabase.from("bonus_picks").select("champion_id").eq("user_id", supabaseUser.id).single(),
          supabase.from("teams").select("*").neq("group_id", "X").order("name"),
          supabase.rpc('calculate_leaderboard') // Fallback to view if RPC fails
      ]);

      // Process Matches
      if (matchRes.data) setMatches(matchRes.data as any);

      // Process Predictions
      const globalPredMap: GlobalPredictions = {};
      const userPredMap: Record<number, Prediction> = {};
      if (matchRes.data) matchRes.data.forEach((m) => { globalPredMap[m.id] = {}; });
      
      if (allPredRes.data) {
          allPredRes.data.forEach((p: any) => {
            if (!globalPredMap[p.match_id]) globalPredMap[p.match_id] = {};
            globalPredMap[p.match_id][p.user_id] = p;
            if (p.user_id === supabaseUser.id) userPredMap[p.match_id] = p;
          });
      }
      setAllPredictions(globalPredMap);
      setPredictions(userPredMap);

      if (bonusRes.data) setChampion(bonusRes.data.champion_id);
      if (teamsRes.data) setAllTeams(teamsRes.data);
      
      // Handle Leaderboard
      if (lbRes.data) setLeaderboard(lbRes.data);
      else {
          const { data: viewData } = await supabase.from("leaderboard_view").select("*");
          if(viewData) setLeaderboard(viewData as any);
      }

      setLoading(false);
    };
    loadData();
  }, []);

  return { 
    user, matches, predictions, setPredictions, allPredictions, 
    leaderboard, champion, setChampion, allTeams, revealCount, setRevealCount, 
    loading, supabase 
  };
}