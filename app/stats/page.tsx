"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { useCustomHabits } from "@/hooks/useCustomHabits";
import { useHabitTracker } from "@/hooks/useHabitTracker";
import { useHabitStats } from "@/hooks/useHabitStats";
import BottomNav from "@/components/BottomNav";
import OverviewCards from "@/components/stats/OverviewCards";
import CategoryBreakdown from "@/components/stats/CategoryBreakdown";
import DailyHeatmap from "@/components/stats/DailyHeatmap";

export default function StatsPage() {
  const { categories } = useCustomHabits();
  const { trackerState, totalXp, streak } = useHabitTracker(categories);
  const {
    activeDays,
    totalTrackedDays,
    overallRate,
    categoryStats,
    dailyCompletions,
  } = useHabitStats(trackerState, categories);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg pb-20">
      <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-header px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
            <BarChart3 className="h-4 w-4" />
          </div>
          <h1 className="text-lg font-bold text-theme-primary">إحصائياتي</h1>
        </div>
      </header>

      <motion.div
        className="flex flex-col gap-5 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <OverviewCards
          totalXp={totalXp}
          streak={streak}
          activeDays={activeDays}
          totalTrackedDays={totalTrackedDays}
          overallRate={overallRate}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DailyHeatmap dailyCompletions={dailyCompletions} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CategoryBreakdown
            categoryStats={categoryStats}
            trackerState={trackerState}
          />
        </motion.div>
      </motion.div>

      <BottomNav activeTab="stats" />
    </div>
  );
}
