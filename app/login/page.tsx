"use client";
import { useState, useRef, useEffect } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { COLORS, TRANSLATIONS } from "../../lib/constants";
import { getFlagUrl } from "../../lib/flags";

type Language = 'en' | 'no' | 'us' | 'sc';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  
  const [lang, setLang] = useState<Language>('en'); 
  const t = TRANSLATIONS[lang];

  const videoRef = useRef<HTMLVideoElement>(null); 
  const router = useRouter();
  const supabase = createClient();

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
        alert(t.authSuccess);
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
              const videoSource = lang === 'no' ? "/videos/intro_no.mp4" : "/videos/intro_en.mp4";
              videoRef.current.src = videoSource; 
              videoRef.current.play().catch(console.error); 
          }
      }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: COLORS.navy }}>
      
      {/* VIDEO OVERLAY */}
      {showVideo && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-in fade-in duration-500" onClick={() => setShowVideo(false)}>
            <div className="relative w-full max-w-4xl aspect-video bg-black shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <video ref={videoRef} className="w-full h-full object-contain" playsInline muted onEnded={() => setShowVideo(false)} />
                <button onClick={() => setShowVideo(false)} className="absolute top-4 right-4 text-white text-2xl font-bold opacity-70 hover:opacity-100">✕</button>
            </div>
        </div>
      )}

      {/* MAIN CONTAINER: Forced max-width of 350px */}
      <div className="w-full" style={{ maxWidth: '350px' }}>
        
        {/* HEADER: OUTSIDE AND ABOVE THE CARD */}
        <div className="text-center mb-6 cursor-pointer group" onClick={triggerVideo}>
            <img 
                src="/icon-192.png" 
                alt="Logo" 
                className="mx-auto mb-3 group-hover:scale-105 transition-transform drop-shadow-lg"
                style={{ width: '100px', height: 'auto' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-5xl">🏆</span>'; }} 
            />
            <h1 className="text-xl font-black text-white uppercase tracking-tighter drop-shadow-md">{t.appName}</h1>
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1 group-hover:text-yellow-400 transition-colors">{t.tapLogo}</p>
        </div>

        {/* CARD: WHITE BOX */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 relative pt-12">
            
            {/* FLAGS: INSIDE CARD, CENTERED AT TOP */}
            <div className="absolute top-3 left-0 right-0 flex justify-center space-x-2">
                {(['en', 'no', 'us', 'sc'] as Language[]).map((l) => (
                <button key={l} onClick={() => handleLangChange(l)} className={`transition-all rounded overflow-hidden shadow-sm hover:shadow-md ${lang === l ? 'ring-2 ring-yellow-400 scale-110' : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100'}`}>
                    <img src={getFlagUrl(l)} alt={l} style={{ width: '28px', height: '18px', objectFit: 'cover' }} />
                </button>
                ))}
            </div>

            {/* TOGGLE BUTTONS */}
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6 mt-2">
                <button onClick={() => setIsSignUp(false)} className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${!isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t.logIn}</button>
                <button onClick={() => setIsSignUp(true)} className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t.signUp}</button>
            </div>

            {/* FORM */}
            <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (<div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.fullName}</label><input type="text" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>)}
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.email}</label><input type="email" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.password}</label><input type="password" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                <button disabled={loading} type="submit" className="w-full py-3.5 text-white text-xs font-black rounded-lg uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 mt-2" style={{backgroundColor: COLORS.navy}}>{loading ? t.processing : (isSignUp ? t.createAccount : t.enterArena)}</button>
            </form>
        </div>
      </div>
      
      {/* COPYRIGHT FOOTER */}
      <p className="mt-8 text-[9px] font-mono text-blue-300 opacity-50 uppercase tracking-widest">© Rasten Cup '26</p>
    </div>
  );
}