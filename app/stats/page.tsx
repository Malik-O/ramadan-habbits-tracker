"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCustomHabits } from "@/hooks/useCustomHabits";
import { useHabitTracker } from "@/hooks/useHabitTracker";
import { useHabitStats } from "@/hooks/useHabitStats";
import BottomNav from "@/components/BottomNav";
import OverviewCards from "@/components/stats/OverviewCards";
import CategoryBreakdown from "@/components/stats/CategoryBreakdown";
import DailyHeatmap from "@/components/stats/DailyHeatmap";
import HabitLineChart from "@/components/stats/HabitLineChart";

export default function StatsPage() {
  const { categories } = useCustomHabits();
  const { trackerState, totalXp, streak } = useHabitTracker(categories);
  
  const {
    activeDays,
    overallRate,
    categoryStats,
    dailyCompletions,
  } = useHabitStats(trackerState, categories);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-header backdrop-blur-xl px-4 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
          >
            <ArrowRight className="h-4 w-4 text-theme-secondary" />
          </Link>
          <h1 className="text-lg font-bold text-theme-primary">الإحصائيات</h1>
        </div>
      </header>

      <div className="flex flex-col gap-5 p-4">
        {/* Overview Cards */}
        <OverviewCards
          totalXp={totalXp}
          streak={streak}
          activeDays={activeDays}
          overallRate={overallRate}
        />

        {/* Daily Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <DailyHeatmap dailyCompletions={dailyCompletions} />
        </motion.div>

        {/* Habit Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <HabitLineChart
            categories={categories}
            trackerState={trackerState}
          />
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CategoryBreakdown
            categoryStats={categoryStats}
            trackerState={trackerState}
          />
        </motion.div>
      </div>

      <BottomNav activeTab="stats" />
    </div>
  );
}
