"use client";

// ✅ 1. Add 'disabled' to the interface
interface ScoreStepperProps {
  value: number | null;
  onChange: (val: number) => void;
  disabled?: boolean; // Optional prop
}

export default function ScoreStepper({ value, onChange, disabled = false }: ScoreStepperProps) {
  
  const displayValue = value === null ? "-" : value;

  const handleIncrement = () => {
    if (disabled) return;
    onChange((value === null ? 0 : value) + 1);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const current = value === null ? 0 : value;
    if (current > 0) onChange(current - 1);
  };

  return (
    <div className={`flex flex-col items-center gap-1 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <button 
        onClick={handleIncrement}
        disabled={disabled}
        className="w-8 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-t-lg transition-colors text-xs"
      >
        ▲
      </button>
      
      <div className={`w-8 h-8 flex items-center justify-center font-bold text-lg border-y border-slate-200 ${value === null ? 'text-slate-300' : 'text-slate-800'}`}>
        {displayValue}
      </div>

      <button 
        onClick={handleDecrement}
        disabled={disabled}
        className="w-8 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-b-lg transition-colors text-xs"
      >
        ▼
      </button>
    </div>
  );
}