import { useMemo } from "react";
import { TOTAL_DAYS, type HabitCategory } from "@/constants/habits";
import { type TrackerState, isHabitCompleted } from "@/hooks/useHabitTracker";

export interface CategoryStat {
  category: HabitCategory;
  completed: number;
  possible: number;
  rate: number;
}

export interface UseHabitStatsReturn {
  activeDays: number;
  overallRate: number;
  categoryStats: CategoryStat[];
  dailyCompletions: number[];
}

export function useHabitStats(
  trackerState: TrackerState,
  categories: HabitCategory[]
): UseHabitStatsReturn {
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

  return {
    activeDays,
    overallRate,
    categoryStats,
    dailyCompletions,
  };
}
