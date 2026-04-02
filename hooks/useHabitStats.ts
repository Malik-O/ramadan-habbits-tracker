import { useMemo } from "react";
import { type HabitCategory } from "@/constants/habits";
import { type TrackerState, isHabitCompleted } from "@/hooks/useHabitTracker";

export interface CategoryStat {
  category: HabitCategory;
  completed: number;
  possible: number;
  rate: number;
}

export interface UseHabitStatsReturn {
  activeDays: number;
  /** Total number of days that have any recorded data */
  totalTrackedDays: number;
  overallRate: number;
  categoryStats: CategoryStat[];
  /** Completion ratio (0–1) per tracked day */
  dailyCompletions: { day: number; value: number }[];
}

export function useHabitStats(
  trackerState: TrackerState,
  categories: HabitCategory[]
): UseHabitStatsReturn {
  const totalHabits = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.items.length, 0),
    [categories]
  );

  const validHabitIds = useMemo(() => {
    const ids = new Set<string>();
    categories.forEach((cat) => cat.items.forEach((item) => ids.add(item.id)));
    return ids;
  }, [categories]);

  // Goal map: habitId → goal (for number habits only)
  const goalMap = useMemo(() => {
    const map = new Map<string, number>();
    categories.forEach((cat) =>
      cat.items.forEach((item) => {
        if (item.type === "number" && item.goal) map.set(item.id, item.goal);
      })
    );
    return map;
  }, [categories]);

  /** All day indices that have any recorded data (sorted ascending) */
  const trackedDayIndices = useMemo(() => {
    return Object.keys(trackerState)
      .map(Number)
      .filter((d) => {
        const record = trackerState[d];
        return record && Object.keys(record).length > 0;
      })
      .sort((a, b) => a - b);
  }, [trackerState]);

  const totalTrackedDays = trackedDayIndices.length;

  /** How many days the user has any valid completed habit */
  const activeDays = useMemo(() => {
    return trackedDayIndices.filter((d) => {
      const record = trackerState[d];
      if (!record) return false;
      return Object.entries(record).some(
        ([id, val]) => validHabitIds.has(id) && isHabitCompleted(val, goalMap.get(id))
      );
    }).length;
  }, [trackedDayIndices, trackerState, validHabitIds, goalMap]);

  /** Overall completion rate across all tracked days */
  const overallRate = useMemo(() => {
    if (totalTrackedDays === 0 || totalHabits === 0) return 0;
    let totalCompleted = 0;
    let totalPossible = 0;
    for (const d of trackedDayIndices) {
      const record = trackerState[d];
      if (record) {
        totalCompleted += Object.entries(record).filter(
          ([id, val]) => validHabitIds.has(id) && isHabitCompleted(val, goalMap.get(id))
        ).length;
        totalPossible += totalHabits;
      }
    }
    return totalPossible > 0 ? totalCompleted / totalPossible : 0;
  }, [trackedDayIndices, trackerState, totalHabits, totalTrackedDays, validHabitIds, goalMap]);

  /** Per-category stats across all tracked days */
  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      let completed = 0;
      let possible = 0;
      for (const d of trackedDayIndices) {
        const record = trackerState[d];
        if (record) {
          for (const item of cat.items) {
            possible++;
            if (isHabitCompleted(record[item.id], goalMap.get(item.id))) {
              completed++;
            }
          }
        }
      }
      const rate = possible > 0 ? completed / possible : 0;
      return { category: cat, completed, possible, rate };
    });
  }, [categories, trackedDayIndices, trackerState, goalMap]);

  /** Daily completion percentages for heatmap — all tracked days */
  const dailyCompletions = useMemo(() => {
    return trackedDayIndices.map((d) => {
      const record = trackerState[d];
      if (!record || totalHabits === 0) return { day: d, value: 0 };
      const completed = Object.entries(record).filter(
        ([id, val]) => validHabitIds.has(id) && isHabitCompleted(val, goalMap.get(id))
      ).length;
      return { day: d, value: completed / totalHabits };
    });
  }, [trackedDayIndices, trackerState, totalHabits, validHabitIds, goalMap]);

  return {
    activeDays,
    totalTrackedDays,
    overallRate,
    categoryStats,
    dailyCompletions,
  };
}
