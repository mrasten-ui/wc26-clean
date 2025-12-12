"use client";
import { useState, useRef, useEffect } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";
// These imports assume your custom data/slang is in these files:
import { COLORS, TRANSLATIONS, TEAM_NAMES_NO } from "../../lib/constants";
import { getFlagUrl } from "../../lib/flags";

type Language = 'en' | 'no' | 'us' | 'sc';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null); 
  const router = useRouter();
  const supabase = createClient();
  
  // State initialization and load from local storage (language persistence)
  const [lang, setLang] = useState<Language>('en'); 
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem("wc26_lang");
    if (savedLang && ['en', 'no', 'us', 'sc'].includes(savedLang)) {
      setLang(savedLang as Language);
    }
  }, []);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("wc26_lang", newLang);
  };

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
        // Use the custom translation for success message
        alert(t.authSuccess || "Account created! You can now log in.");
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
              // Uses language-specific video if available, falls back to English (default)
              const videoSource = lang === 'no' ? "/videos/intro_no.mp4" : "/videos/intro_en.mp4";
              videoRef.current.src = videoSource; 
              videoRef.current.play().catch(console.error); 
          }
      }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: COLORS.navy }}>
      
      {/* LANGUAGE FLAGS - NOW WITH ALL FOUR OPTIONS */}
      <div className="absolute top-4 right-4 flex space-x-2 z-10">
        {(['en', 'no', 'us', 'sc'] as Language[]).map((l) => (
          <button
            key={l}
            onClick={() => handleLangChange(l)}
            className={`transition-all rounded overflow-hidden shadow-md ${lang === l ? 'ring-2 ring-yellow-400 scale-105' : 'opacity-60 hover:opacity-100'}`}
          >
            <img src={getFlagUrl(l)} alt={l} className="w-8 h-6 object-cover" />
          </button>
        ))}
      </div>

      {/* VIDEO OVERLAY */}
      {showVideo && (
        <div 
            className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-in fade-in duration-500"
            onClick={() => setShowVideo(false)}
        >
            <div className="relative w-full max-w-4xl aspect-video bg-black" onClick={(e) => e.stopPropagation()}>
                <video 
                    ref={videoRef}
                    src={lang === 'no' ? "/videos/intro_no.mp4" : "/videos/intro_en.mp4"}
                    className="w-full h-full object-contain" 
                    playsInline muted 
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
                <img src="/logo/wc26-logo-500.png" alt="Rasten Cup Logo" className="w-full h-full object-contain p-1" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">{t.appName || "The Rasten Cup '26"}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 group-hover:text-yellow-400 transition-colors">{t.tapLogo || "Tap logo for Intro"}</p>
        </div>

        {/* Form */}
        <div className="p-8">
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button onClick={() => setIsSignUp(false)} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${!isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t.logIn || "Log In"}</button>
                <button onClick={() => setIsSignUp(true)} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t.signUp || "Sign Up"}</button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.fullName || "Full Name / Nickname"}</label>
                        <input type="text" required className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-slate-300" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                )}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.email || "Email Address"}</label>
                    <input type="email" required className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-slate-300" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.password || "Password"}</label>
                    <input type="password" required className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-slate-300" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button disabled={loading} type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-xl uppercase tracking-wider hover:bg-slate-800 transition-transform active:scale-95 shadow-lg mt-4">
                    {loading ? (t.processing || "Processing...") : (isSignUp ? (t.createAccount || "Create Account") : (t.enterArena || "Enter Arena"))}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}