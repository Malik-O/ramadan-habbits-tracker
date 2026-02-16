"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Target, Award, Flame } from "lucide-react";
import Link from "next/link";
import { TOTAL_DAYS } from "@/constants/habits";
import { useCustomHabits } from "@/hooks/useCustomHabits";
import { useHabitTracker, isHabitCompleted } from "@/hooks/useHabitTracker";
import BottomNav from "@/components/BottomNav";
import OverviewCards from "@/components/stats/OverviewCards";
import CategoryBreakdown from "@/components/stats/CategoryBreakdown";
import DailyHeatmap from "@/components/stats/DailyHeatmap";

export default function StatsPage() {
  const { categories } = useCustomHabits();
  const {
    trackerState,
    totalXp,
    streak,
  } = useHabitTracker(categories);

  const totalHabits = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.items.length, 0),
    [categories]
  );

  /** How many days the user has any activity */
  const activeDays = useMemo(() => {
    let count = 0;
    for (let d = 0; d < TOTAL_DAYS; d++) {
      const record = trackerState[d];
      if (record && Object.values(record).some(isHabitCompleted)) {
        count++;
      }
    }
    return count;
  }, [trackerState]);

  /** Overall completion rate across all days */
  const overallRate = useMemo(() => {
    if (activeDays === 0 || totalHabits === 0) return 0;
    let totalCompleted = 0;
    let totalPossible = 0;
    for (let d = 0; d < TOTAL_DAYS; d++) {
      const record = trackerState[d];
      if (record) {
        totalCompleted += Object.values(record).filter(isHabitCompleted).length;
        totalPossible += totalHabits;
      }
    }
    return totalPossible > 0 ? totalCompleted / totalPossible : 0;
  }, [trackerState, totalHabits, activeDays]);

  /** Per-category stats */
  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      let completed = 0;
      let possible = 0;
      for (let d = 0; d < TOTAL_DAYS; d++) {
        const record = trackerState[d];
        if (record) {
          for (const item of cat.items) {
            possible++;
            if (isHabitCompleted(record[item.id])) {
              completed++;
            }
          }
        }
      }
      const rate = possible > 0 ? completed / possible : 0;
      return { category: cat, completed, possible, rate };
    });
  }, [categories, trackerState]);

  /** Daily completion percentages for heatmap */
  const dailyCompletions = useMemo(() => {
    return Array.from({ length: TOTAL_DAYS }, (_, d) => {
      const record = trackerState[d];
      if (!record || totalHabits === 0) return 0;
      const completed = Object.values(record).filter(isHabitCompleted).length;
      return completed / totalHabits;
    });
  }, [trackerState, totalHabits]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg pb-20">
      {/* Header */}
      <header className="border-b border-theme-border bg-theme-header px-4 py-4">
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

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
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
