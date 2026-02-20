"use client";

import { motion } from "framer-motion";
import { Trophy, Users } from "lucide-react";

export type LeaderboardTab = "leaderboard" | "groups";

interface LeaderboardTabSwitcherProps {
  activeTab: LeaderboardTab;
  onTabChange: (tab: LeaderboardTab) => void;
}

const TABS: { id: LeaderboardTab; label: string; icon: typeof Trophy }[] = [
  { id: "leaderboard", label: "المتصدرين", icon: Trophy },
  { id: "groups", label: "المجموعات", icon: Users },
];

export default function LeaderboardTabSwitcher({
  activeTab,
  onTabChange,
}: LeaderboardTabSwitcherProps) {
  return (
    <div className="mx-4 mt-3 flex gap-1 rounded-2xl bg-theme-subtle p-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "text-theme-primary"
                : "text-theme-secondary hover:text-theme-primary"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-xl bg-theme-card shadow-sm"
                transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              />
            )}
            <Icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
