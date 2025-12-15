"use client";

interface ScoreStepperProps {
  value: number | null | undefined;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export default function ScoreStepper({ value, onChange, disabled = false }: ScoreStepperProps) {
  
  // Display "-" if null/undefined, otherwise the number
  const displayValue = (value === null || value === undefined) ? "-" : value;

  const handleIncrement = () => {
    if (disabled) return;
    // If empty, set to 0. If number, add 1.
    if (value === null || value === undefined) {
      onChange(0);
    } else {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (disabled) return;
    // If empty, set to 0.
    if (value === null || value === undefined) {
      onChange(0);
      return;
    }
    // Standard decrement (min 0)
    if (value > 0) onChange(value - 1);
  };

  return (
    <div className={`flex flex-col items-center gap-0.5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* UP BUTTON (Bigger) */}
      <button 
        onClick={handleIncrement}
        disabled={disabled}
        type="button"
        className="w-12 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-t-xl transition-colors text-xs active:bg-slate-300 active:scale-95 touch-manipulation"
      >
        ▲
      </button>
      
      {/* SCORE BOX (Bigger Font) */}
      <div className={`w-12 h-12 flex items-center justify-center font-black text-2xl border-y border-slate-200 bg-white ${displayValue === '-' ? 'text-slate-300' : 'text-slate-900'}`}>
        {displayValue}
      </div>

      {/* DOWN BUTTON (Bigger) */}
      <button 
        onClick={handleDecrement}
        disabled={disabled}
        type="button"
        className="w-12 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-b-xl transition-colors text-xs active:bg-slate-300 active:scale-95 touch-manipulation"
      >
        ▼
      </button>
    </div>
  );
}