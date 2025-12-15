"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize a local client just for this test
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function DebugSaver({ user }: { user: any }) {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  const runTest = async () => {
    setLog([]); // Clear log
    addLog("🚀 Starting Diagnostic Test...");

    // 1. Check User Auth
    if (!user) {
      addLog("❌ FAIL: No User object passed to component.");
      return;
    }
    addLog(`👤 User ID from App: ${user.id}`);

    // 2. Check Supabase Session
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData.session?.user;
    
    if (!sessionUser) {
        addLog("❌ FAIL: Supabase Client has NO Session! (RLS will block you)");
    } else {
        addLog(`✅ Supabase Session Active for: ${sessionUser.id}`);
        if (sessionUser.id !== user.id) addLog("⚠️ WARNING: Mismatch between App User and Session User!");
    }

    // 3. Try a Dummy Insert
    const dummyPrediction = {
        user_id: user.id,
        match_id: 999999, // Fake match ID
        home_score: 0,
        away_score: 0
    };

    addLog(`💾 Attempting save for Match 999999...`);
    
    const { data, error } = await supabase
        .from('predictions')
        .upsert([dummyPrediction], { onConflict: 'user_id, match_id' })
        .select();

    if (error) {
        addLog(`❌ DATABASE ERROR: ${error.message}`);
        addLog(`Details: ${JSON.stringify(error)}`);
    } else {
        addLog("✅ SUCCESS! Database accepted the row.");
        addLog(`Data returned: ${JSON.stringify(data)}`);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] w-96 bg-black/90 text-green-400 p-4 rounded-xl shadow-2xl font-mono text-xs border border-green-500/30">
      <h3 className="font-bold text-white mb-2 border-b border-white/20 pb-1">⚡ Rasten Diagnostics</h3>
      <div className="mb-3 max-h-48 overflow-y-auto space-y-1">
        {log.length === 0 ? <span className="text-slate-500">Ready to test...</span> : log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <button 
        onClick={runTest}
        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded transition-colors"
      >
        RUN SAVE TEST
      </button>
    </div>
  );
}