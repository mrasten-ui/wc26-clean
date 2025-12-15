// components/ScoreStepper.tsx

"use client";

interface ScoreStepperProps {
  value: number | null | undefined;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export default function ScoreStepper({ value, onChange, disabled = false }: ScoreStepperProps) {
  
  // Display "-" if null/undefined, otherwise the number (0 included)
  const displayValue = (value === null || value === undefined) ? "-" : value;

  const handleIncrement = () => {
    if (disabled) return;
    // If empty, set to 0. If number, add 1.
    const current = (value === null || value === undefined) ? -1 : value;
    onChange(current + 1);
  };

  const handleDecrement = () => {
    if (disabled) return;
    // Standard decrement (min 0)
    const current = (value === null || value === undefined) ? 0 : value; // Treat empty as 0 for this check
    
    if (current > 0) {
      onChange(current - 1);
    } else if (current === 0) {
      // You can decide if clicking down on 0 should make it null/empty, but sticking to 0 for stability
      onChange(0);
    }
    // Note: The logic to set the OPPONENT to 0 is now in GroupStage.tsx
  };

  return (
    <div className={`flex flex-col items-center gap-0.5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* UP BUTTON (W-12 H-9 is the large size) */}
      <button 
        onClick={handleIncrement}
        disabled={disabled}
        type="button"
        className="w-12 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-t-xl transition-colors text-xs active:bg-slate-300 active:scale-95 touch-manipulation"
      >
        ▲
      </button>
      
      {/* SCORE BOX (W-12 H-12 is the large size) */}
      <div className={`w-12 h-12 flex items-center justify-center font-black text-2xl border-y border-slate-200 bg-white ${displayValue === '-' ? 'text-slate-300' : 'text-slate-900'}`}>
        {displayValue}
      </div>

      {/* DOWN BUTTON (W-12 H-9 is the large size) */}
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