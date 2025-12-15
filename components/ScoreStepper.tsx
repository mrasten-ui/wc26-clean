"use client";

interface ScoreStepperProps {
  value: number | null;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export default function ScoreStepper({ value, onChange, disabled = false }: ScoreStepperProps) {
  
  // If value is null, show "-", otherwise show the number (even if 0)
  const displayValue = value === null ? "-" : value;

  const handleIncrement = () => {
    if (disabled) return;
    // If empty, start at 0. If number, go up.
    if (value === null) {
      onChange(0);
    } else {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (disabled) return;
    // If empty, start at 0.
    if (value === null) {
      onChange(0);
      return;
    }
    // Prevent going below 0
    if (value > 0) {
      onChange(value - 1);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-0.5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* BUTTON TOP (UP) - Bigger Touch Target */}
      <button 
        onClick={handleIncrement}
        disabled={disabled}
        className="w-12 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-t-xl transition-colors text-xs active:bg-slate-300 active:scale-95"
      >
        ▲
      </button>
      
      {/* SCORE DISPLAY - Bigger Font & Box */}
      <div className={`w-12 h-12 flex items-center justify-center font-black text-2xl border-y border-slate-200 bg-white ${value === null ? 'text-slate-300' : 'text-slate-900'}`}>
        {displayValue}
      </div>

      {/* BUTTON BOTTOM (DOWN) - Bigger Touch Target */}
      <button 
        onClick={handleDecrement}
        disabled={disabled}
        className="w-12 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-b-xl transition-colors text-xs active:bg-slate-300 active:scale-95"
      >
        ▼
      </button>
    </div>
  );
}