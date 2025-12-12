"use client";
import { useState, useRef } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) alert(error.message);
      else {
        alert("Account created! You can now log in.");
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else router.push("/");
    }
    setLoading(false);
  };

  const triggerVideo = () => {
      setShowVideo(true);
      setTimeout(() => {
          if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.play().catch(console.error);
          }
      }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      
      {/* VIDEO OVERLAY */}
      {showVideo && (
        <div 
            className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-in fade-in duration-500"
            onClick={() => setShowVideo(false)}
        >
            <div className="relative w-full max-w-4xl aspect-video bg-black">
                <video 
                    ref={videoRef}
                    src="/videos/intro_en.mp4" 
                    className="w-full h-full object-contain" 
                    autoPlay playsInline muted 
                    onEnded={() => setShowVideo(false)}
                />
                <button onClick={() => setShowVideo(false)} className="absolute top-4 right-4 text-white text-2xl font-bold opacity-50 hover:opacity-100">✕</button>
            </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-800">
        {/* Header with Logo Click */}
        <div className="bg-slate-800 p-8 text-center cursor-pointer group" onClick={triggerVideo}>
            <div className="w-20 h-20 bg-slate-700 rounded-full mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg border-2 border-slate-600">
                <span className="text-4xl">🏆</span>
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">The Rasten Cup '26</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 group-hover:text-yellow-400 transition-colors">Tap logo for Intro</p>
        </div>

        {/* Form */}
        <div className="p-8">
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button onClick={() => setIsSignUp(false)} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${!isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Log In</button>
                <button onClick={() => setIsSignUp(true)} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Sign Up</button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name / Nickname</label>
                        <input type="text" required className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-slate-300" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                )}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                    <input type="email" required className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-slate-300" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                    <input type="password" required className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-slate-300" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button disabled={loading} type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-xl uppercase tracking-wider hover:bg-slate-800 transition-transform active:scale-95 shadow-lg mt-4">
                    {loading ? "Processing..." : (isSignUp ? "Create Account" : "Enter Arena")}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}