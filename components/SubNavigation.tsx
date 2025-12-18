"use client";
import { GROUPS, KNOCKOUT_STAGES, STAGE_COLORS } from "../lib/constants";
import { motion } from "framer-motion";

interface SubNavigationProps {
  currentMainTab: "MATCHES" | "GROUPS" | "KNOCKOUT" | "RULES" | "RESULTS";
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeKnockoutRound: string;
  setActiveKnockoutRound: (round: string) => void;
  // ✅ RESTORED: These props are required by Header.tsx
  showTools: boolean;
  hasPredictions: boolean;
  isGenerating: boolean;
  handleSmartAutoFill: () => void;
  handleSmartClear: () => void;
  getSubTabStatusDot: (id: string) => string;
  getKnockoutDot: (id: string) => string;
}

export default function SubNavigation({
  currentMainTab,
  activeTab,
  setActiveTab,
  activeKnockoutRound,
  setActiveKnockoutRound,
  showTools,
  hasPredictions,
  isGenerating,
  handleSmartAutoFill,
  handleSmartClear,
  getSubTabStatusDot,
  getKnockoutDot
}: SubNavigationProps) {

  // HELPER: Render Tools (Wand / Trash)
  const Tools = () => {
    if (!showTools) return null;
    return (
      <div className="flex items-center gap-2 pl-4 border-l border-white/10 ml-2">
        <button
          onClick={handleSmartAutoFill}
          disabled={isGenerating}
          className="p-2 bg-blue-500/20 hover:bg-blue-500 text-blue-200 hover:text-white rounded-lg transition-all group relative"
          title="Auto-fill with AI"
        >
          {isGenerating ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM9 15a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 019 15z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {hasPredictions && (
          <button
            onClick={handleSmartClear}
            className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all"
            title="Clear Predictions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  // RENDER GROUP TABS
  if (currentMainTab === 'GROUPS') {
    return (
      <div className="bg-slate-900 border-b border-white/10 overflow-x-auto no-scrollbar py-2">
        <div className="flex px-4 items-center min-w-max">
          <div className="flex gap-2">
            {GROUPS.map((group) => {
              const statusColor = getSubTabStatusDot(group);
              const isActive = activeTab === group;
              return (
                <button
                  key={group}
                  onClick={() => setActiveTab(group)}
                  className={`
                    relative px-4 py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 min-w-[50px]
                    ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <span>{group}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
                  {isActive && <motion.div layoutId="activeGroup" className="absolute inset-0 border border-blue-400/30 rounded-lg" />}
                </button>
              );
            })}
          </div>
          <Tools />
        </div>
      </div>
    );
  }

  // RENDER KNOCKOUT TABS
  if (currentMainTab === 'KNOCKOUT') {
    return (
      <div className="bg-slate-900 border-b border-white/10 overflow-x-auto no-scrollbar py-2">
        <div className="flex px-4 items-center min-w-max">
          <div className="flex gap-2">
            {KNOCKOUT_STAGES.map((stage) => {
              const statusColor = getKnockoutDot(stage);
              const isActive = activeKnockoutRound === stage;
              const label = stage === 'QUARTER_FINAL' ? 'QF' : (stage === 'SEMI_FINAL' ? 'SF' : (stage === 'THIRD_PLACE' ? '3RD' : stage.replace('_', ' ')));
              const stageColor = STAGE_COLORS[stage] || '#ccc';

              return (
                <button
                  key={stage}
                  onClick={() => setActiveKnockoutRound(stage)}
                  className={`
                     relative px-3 py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 whitespace-nowrap overflow-hidden
                     ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                   <span className="relative z-10">{label}</span>
                   {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: stageColor }} />}
                   <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
                   {isActive && <motion.div layoutId="activeKo" className="absolute inset-0 border border-white/10 rounded-lg" />}
                </button>
              );
            })}
          </div>
          <Tools />
        </div>
      </div>
    );
  }

  return null;
}