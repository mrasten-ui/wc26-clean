"use client";

interface ScoreStepperProps {
  value: number | null | undefined; // ✅ Allow undefined to prevent crashes
  onChange: (val: number) => void;
  disabled?: boolean;
}

export default function ScoreStepper({ value, onChange, disabled = false }: ScoreStepperProps) {
  
  // Safe display: If null or undefined, show "-"
  const displayValue = (value === null || value === undefined) ? "-" : value;

  const handleIncrement = () => {
    if (disabled) return;
    // Treat null/undefined as -1 so the next step is 0
    const current = (value === null || value === undefined) ? -1 : value;
    onChange(current + 1);
  };

  const handleDecrement = () => {
    if (disabled) return;
    // If empty, force to 0.
    if (value === null || value === undefined) {
      onChange(0);
      return;
    }
    // Standard decrement
    if (value > 0) onChange(value - 1);
  };

  return (
    <div className={`flex flex-col items-center gap-0.5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* UP BUTTON */}
      <button 
        onClick={handleIncrement}
        disabled={disabled}
        type="button"
        className="w-12 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-t-xl transition-colors text-xs active:bg-slate-300"
      >
        ▲
      </button>
      
      {/* SCORE BOX */}
      <div className={`w-12 h-12 flex items-center justify-center font-black text-2xl border-y border-slate-200 bg-white ${displayValue === '-' ? 'text-slate-300' : 'text-slate-900'}`}>
        {displayValue}
      </div>

      {/* DOWN BUTTON */}
      <button 
        onClick={handleDecrement}
        disabled={disabled}
        type="button"
        className="w-12 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-b-xl transition-colors text-xs active:bg-slate-300"
      >
        ▼
      </button>
    </div>
  );
}