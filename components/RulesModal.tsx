"use client";

export default function RulesModal({ isOpen, onClose, t }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in">
        <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold">✕</button>
            
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">How to Play</h2>
            
            <div className="space-y-4 text-sm text-slate-600">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h3 className="font-black text-blue-900 mb-1">Group Stage</h3>
                    <p>Predict exact scores. <br/><strong>3 Points</strong> for Exact Score.<br/><strong>1 Point</strong> for Correct Result (Win/Draw).</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <h3 className="font-black text-purple-900 mb-1">Knockout Stage</h3>
                    <p>Pick the winner of each tie. Points increase each round:<br/>R32 (2pts) → R16 (4pts) → QF (6pts) → SF (8pts) → Final (10pts).</p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <h3 className="font-black text-yellow-900 mb-1">The Helping Hand</h3>
                    <p>Use the <strong>Wand Icon</strong> to auto-fill predictions based on FIFA rankings and your favorite teams.</p>
                </div>
            </div>

            <button onClick={onClose} className="w-full mt-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                Let's Play!
            </button>
        </div>
    </div>
  );
}