"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { TRANSLATIONS } from '../lib/constants';

// Define valid keys based on what actually exists in TRANSLATIONS
type Language = 'en' | 'no' | 'us' | 'sc';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('en');

  // ✅ FIX: Safe Translation Lookup
  // If the selected language doesn't exist, it falls back to English ('en')
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Attempt to load saved language
    const savedLang = localStorage.getItem('wc26_lang') as Language;
    if (savedLang && ['en', 'no', 'us', 'sc'].includes(savedLang)) {
        setLang(savedLang);
    }

    if (videoRef.current) {
        videoRef.current.playbackRate = 0.7;
    }
  }, []);

  const handleLanguageChange = (l: Language) => {
      setLang(l);
      localStorage.setItem('wc26_lang', l);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) setError(error.message);
      else {
          alert('Check your email for the confirmation link!');
          setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else router.push('/');
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans">
      
      {/* BACKGROUND VIDEO */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-navy-900/80 z-10" /> 
         <video 
            ref={videoRef}
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-40"
         >
            <source src="/intro.mp4" type="video/mp4" />
         </video>
         
         {/* OVERLAY GRADIENT */}
         <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent z-20" />
      </div>

      {/* LANGUAGE SWITCHER */}
      <div className="absolute top-6 left-6 z-50 flex gap-3">
          <button onClick={() => handleLanguageChange('en')} className={`transition-transform hover:scale-110 ${lang === 'en' ? 'opacity-100 scale-110' : 'opacity-50'}`}>
              <img src="/flags/gb.svg" className="w-8 h-6 rounded shadow-lg" alt="English" />
          </button>
          <button onClick={() => handleLanguageChange('no')} className={`transition-transform hover:scale-110 ${lang === 'no' ? 'opacity-100 scale-110' : 'opacity-50'}`}>
              <img src="/flags/no.svg" className="w-8 h-6 rounded shadow-lg" alt="Norsk" />
          </button>
          <button onClick={() => handleLanguageChange('us')} className={`transition-transform hover:scale-110 ${lang === 'us' ? 'opacity-100 scale-110' : 'opacity-50'}`}>
              <img src="/flags/us.svg" className="w-8 h-6 rounded shadow-lg" alt="USA" />
          </button>
          <button onClick={() => handleLanguageChange('sc')} className={`transition-transform hover:scale-110 ${lang === 'sc' ? 'opacity-100 scale-110' : 'opacity-50'}`}>
              <img src="/flags/scot.svg" className="w-8 h-6 rounded shadow-lg" alt="Scottish" />
          </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-30 flex flex-col items-center justify-center min-h-screen px-4">
        
        {/* LOGO AREA */}
        <div className="mb-8 flex flex-col items-center animate-fade-in-down">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl mb-4 group hover:bg-white/20 transition-all cursor-pointer">
                <span className="text-5xl group-hover:scale-110 transition-transform">🏆</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter text-center drop-shadow-lg">
                {t?.appName || "THE RASTEN CUP '26"}
            </h1>
            <div className="h-1 w-20 bg-blue-500 rounded-full mt-4 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
        </div>

        {/* LOGIN CARD */}
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-fade-in-up">
            
            <div className="flex justify-center mb-8">
                <div className="flex bg-black/30 p-1 rounded-full">
                    <button 
                        onClick={() => setIsSignUp(false)}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${!isSignUp ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => setIsSignUp(true)}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${isSignUp ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Sign Up
                    </button>
                </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
                {isSignUp && (
                    <div className="group">
                        <label className="block text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-1 ml-2">Full Name</label>
                        <input
                            type="text"
                            placeholder="Cristiano Ronaldo"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-black/40 transition-all text-sm font-medium"
                            required
                        />
                    </div>
                )}

                <div className="group">
                    <label className="block text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-1 ml-2">Email Address</label>
                    <input
                        type="email"
                        placeholder="player@worldcup.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-black/40 transition-all text-sm font-medium"
                        required
                    />
                </div>

                <div className="group">
                    <label className="block text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-1 ml-2">Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-black/40 transition-all text-sm font-medium"
                        required
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-xs font-bold text-center">
                        ⚠️ {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-blue-900/50 transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <span>{isSignUp ? 'Create Account' : 'Enter Stadium'}</span>
                    )}
                </button>
            </form>

        </div>
        
        <p className="mt-8 text-slate-500 text-xs font-medium">
            © 2026 Official Tournament Predictor
        </p>
      </div>
    </div>
  );
}