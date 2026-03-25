"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Trophy } from "lucide-react";
import { useCustomHabits } from "@/hooks/useCustomHabits";
import { useHabitTracker } from "@/hooks/useHabitTracker";
import { useHabitStats } from "@/hooks/useHabitStats";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import OverviewCards from "@/components/stats/OverviewCards";
import CategoryBreakdown from "@/components/stats/CategoryBreakdown";
import DailyHeatmap from "@/components/stats/DailyHeatmap";
import HabitLineChart from "@/components/stats/HabitLineChart";
import StatsLeaderboard from "@/components/stats/StatsLeaderboard";
import LeaderboardSignInPrompt from "@/components/leaderboard/LeaderboardSignInPrompt";

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState<"stats" | "leaderboard">("leaderboard");
  
  const { categories } = useCustomHabits();
  const { trackerState, totalXp, streak } = useHabitTracker(categories);
  const {
    activeDays,
    overallRate,
    categoryStats,
    dailyCompletions,
  } = useHabitStats(trackerState, categories);
  
  const { user, isLoading: isAuthLoading } = useAuth();
  const isSignedIn = !!user;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg pb-20">
      <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-header px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-lg font-bold text-theme-primary">الأداء العام</h1>
        </div>

        {/* Tab Switcher */}
        <div className="relative flex rounded-xl bg-theme-subtle p-1">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`relative z-10 flex w-1/2 items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
              activeTab === "leaderboard"
                ? "text-theme-primary"
                : "text-theme-secondary hover:text-theme-primary"
            }`}
          >
            <Trophy className="h-4 w-4" />
            المتصدرين
            {activeTab === "leaderboard" && (
              <motion.div
                layoutId="statsTab"
                className="absolute inset-0 -z-10 rounded-lg bg-theme-bg shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`relative z-10 flex w-1/2 items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
              activeTab === "stats"
                ? "text-theme-primary"
                : "text-theme-secondary hover:text-theme-primary"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            إحصائياتي
            {activeTab === "stats" && (
              <motion.div
                layoutId="statsTab"
                className="absolute inset-0 -z-10 rounded-lg bg-theme-bg shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
          </button>
        </div>
      </header>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === "stats" ? (
            <motion.div
              key="stats-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5 p-4"
            >
              <OverviewCards totalXp={totalXp} streak={streak} activeDays={activeDays} overallRate={overallRate} />
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <DailyHeatmap dailyCompletions={dailyCompletions} />
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <HabitLineChart categories={categories} trackerState={trackerState} />
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <CategoryBreakdown categoryStats={categoryStats} trackerState={trackerState} />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="leaderboard-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {isAuthLoading ? (
                <div className="p-4 flex flex-col gap-4">
                  <div className="h-24 rounded-2xl bg-theme-subtle animate-pulse" />
                  <div className="flex-1 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 rounded-2xl bg-theme-subtle animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : isSignedIn ? (
                <StatsLeaderboard currentUserUid={user.uid} />
              ) : (
                <div className="p-4">
                  <LeaderboardSignInPrompt />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav activeTab="stats" />
    </div>
  );
}
