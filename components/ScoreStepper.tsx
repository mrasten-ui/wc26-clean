"use client";

interface ScoreStepperProps {
  value: number | null;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export default function ScoreStepper({ value, onChange, disabled = false }: ScoreStepperProps) {
  
  // Logic: If null, show "-", otherwise show number
  const displayValue = value === null ? "-" : value;

  const handleIncrement = () => {
    if (disabled) return;
    // If null, start at 0. If number, add 1.
    const start = value === null ? -1 : value; 
    onChange(start + 1);
  };

  const handleDecrement = () => {
    if (disabled) return;
    // If null, do nothing. If 0, stay 0. If >0, subtract 1.
    if (value === null) {
        onChange(0); // Optional: Clicking down on '-' sets it to 0
        return;
    }
    if (value > 0) onChange(value - 1);
  };

  return (
    <div className={`flex flex-col items-center gap-0.5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Increased height from h-6 to h-8 for easier clicking */}
      <button 
        onClick={handleIncrement}
        disabled={disabled}
        className="w-10 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-t-lg transition-colors text-xs active:bg-slate-300"
      >
        ▲
      </button>
      
      <div className={`w-10 h-10 flex items-center justify-center font-black text-xl border-y border-slate-200 bg-white ${value === null ? 'text-slate-300' : 'text-slate-900'}`}>
        {displayValue}
      </div>

      <button 
        onClick={handleDecrement}
        disabled={disabled}
        className="w-10 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-b-lg transition-colors text-xs active:bg-slate-300"
      >
        ▼
      </button>
    </div>
  );
}