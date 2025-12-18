"use client";
import { GROUPS, KNOCKOUT_STAGES } from "../lib/constants"; 
import { motion } from "framer-motion";

interface SubNavigationProps {
  currentMainTab: "MATCHES" | "GROUPS" | "KNOCKOUT" | "RULES" | "RESULTS";
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeKnockoutRound: string;
  setActiveKnockoutRound: (round: string) => void;
  getSubTabStatusDot: (id: string) => string;
  getKnockoutDot: (id: string) => string;
}

export default function SubNavigation({
  currentMainTab,
  activeTab,
  setActiveTab,
  activeKnockoutRound,
  setActiveKnockoutRound,
  getSubTabStatusDot,
  getKnockoutDot
}: SubNavigationProps) {

  // RENDER GROUP TABS
  if (currentMainTab === 'GROUPS') {
    return (
      <div className="bg-slate-900 border-b border-white/10 overflow-x-auto no-scrollbar py-2">
        <div className="flex px-4 gap-2 min-w-max">
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
      </div>
    );
  }

  // RENDER KNOCKOUT TABS
  if (currentMainTab === 'KNOCKOUT') {
    return (
      <div className="bg-slate-900 border-b border-white/10 overflow-x-auto no-scrollbar py-2">
        <div className="flex px-4 gap-2 min-w-max">
          {KNOCKOUT_STAGES.map((stage) => {
            const statusColor = getKnockoutDot(stage);
            const isActive = activeKnockoutRound === stage;
            const label = stage === 'QUARTER_FINAL' ? 'QF' : (stage === 'SEMI_FINAL' ? 'SF' : (stage === 'THIRD_PLACE' ? '3RD' : stage.replace('_', ' ')));
            
            return (
              <button
                key={stage}
                onClick={() => setActiveKnockoutRound(stage)}
                className={`
                   relative px-3 py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 whitespace-nowrap
                   ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
              >
                 <span>{label}</span>
                 <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
                 {isActive && <motion.div layoutId="activeKo" className="absolute inset-0 border border-red-400/30 rounded-lg" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}