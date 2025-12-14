"use client";
import React from 'react';

interface ScoreStepperProps {
    value: number | null | undefined;
    onChange: (val: number) => void;
}

export default function ScoreStepper({ value, onChange }: ScoreStepperProps) {
    
    // ✅ Standard React Event Handlers (Fixes the bubbling issue)
    const handleUp = (e: React.MouseEvent) => {
        e.preventDefault(); 
        e.stopPropagation(); // Stop the click from bubbling to the match card
        if (value == null) onChange(0);
        else onChange(value + 1);
    };

    const handleDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (value == null) onChange(0);
        else if (value > 0) onChange(value - 1);
    };

    const isActive = value != null;
    
    // Visual Styles
    const containerClass = isActive 
        ? "bg-white ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] text-slate-900" 
        : "bg-slate-100 border border-slate-200 text-slate-300"; 
        
    const numberClass = isActive ? "scale-110 font-black" : "font-medium";

    const buttonBase = "w-full flex items-center justify-center transition-colors touch-manipulation cursor-pointer hover:bg-black/5 active:scale-95";
    const buttonColors = isActive ? "text-slate-600" : "text-slate-400";

    return (
        <div className={`flex flex-col items-center justify-between w-12 sm:w-14 h-24 rounded-2xl transition-all duration-300 select-none overflow-hidden ${containerClass}`}>
            
            {/* UP BUTTON */}
            <button 
                type="button" 
                onClick={handleUp} 
                className={`${buttonBase} ${buttonColors} h-1/3 pt-1`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
                </svg>
            </button>

            {/* SCORE DISPLAY */}
            <div className={`h-1/3 flex items-center justify-center text-3xl leading-none transition-transform duration-300 ${numberClass}`}>
                {value ?? '-'}
            </div>

            {/* DOWN BUTTON */}
            <button 
                type="button"
                onClick={handleDown} 
                className={`${buttonBase} ${buttonColors} h-1/3 pb-1`}
                disabled={value === 0} 
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};