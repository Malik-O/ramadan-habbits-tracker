"use client";

import { useCallback, useMemo, useEffect } from "react";
import { XP_PER_HABIT, RAMADAN_START_DATE, type HabitCategory } from "@/constants/habits";
import { getRamadanDay } from "@/utils/date";
import { useLocalStorage } from "./useLocalStorage";
import { useState } from "react";

/** State shape for a single habit: `true` for completed booleans, or a number for counters */
export type HabitValue = boolean | number;

/** Per-day record: habitId → value */
export type DayRecord = Record<string, HabitValue>;

/** Full tracker state: dayIndex (0-29) → DayRecord */
export type TrackerState = Record<number, DayRecord>;

/** Per-day last-modified timestamps: dayIndex → ISO string */
export type DayUpdatedAtMap = Record<number, string>;

export interface UseHabitTrackerReturn {
  currentDay: number;
  setCurrentDay: (day: number) => void;
  trackerState: TrackerState;
  setTrackerState: (state: TrackerState) => void;
  dayUpdatedAt: DayUpdatedAtMap;
  setDayUpdatedAt: (map: DayUpdatedAtMap) => void;
  toggleHabit: (habitId: string) => void;
  setHabitValue: (habitId: string, value: number) => void;
  getHabitValue: (habitId: string) => HabitValue;
  todayProgress: number;
  streak: number;
  blockCompletion: Record<string, boolean>;
  totalHabits: number;
  completedHabits: number;
}

export function isHabitCompleted(value: HabitValue | undefined): boolean {
  if (value === undefined) return false;
  if (typeof value === "boolean") return value;
  return value > 0;
}

function countCompletedInDay(dayRecord: DayRecord | undefined, validHabitIds?: Set<string>): number {
  if (!dayRecord) return 0;
  return Object.entries(dayRecord).filter(([id, val]) => {
    if (validHabitIds && !validHabitIds.has(id)) return false;
    return isHabitCompleted(val);
  }).length;
}

function computeStreak(state: TrackerState, currentDay: number, validHabitIds: Set<string>): number {
  let streak = 0;
  for (let d = currentDay; d >= 0; d--) {
    if (countCompletedInDay(state[d], validHabitIds) > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}


export function useHabitTracker(categories: HabitCategory[]): UseHabitTrackerReturn {
  const defaultDay = useMemo(() => {
    // Current day in Ramadan based on the start date (1-indexed from utility)
    const currentRamadanDay = getRamadanDay(RAMADAN_START_DATE);
    // Convert to 0-indexed (no upper clamp so it continues past 30 days)
    return currentRamadanDay - 1;
  }, []);

  const [currentDay, setCurrentDay] = useState<number>(defaultDay);
  const [trackerState, setTrackerState] = useLocalStorage<TrackerState>("hemma-tracker", {});
  const [dayUpdatedAt, setDayUpdatedAt] = useLocalStorage<DayUpdatedAtMap>("hemma-day-updated-at", {});


  const dayRecord = trackerState[currentDay] || {};

  const getHabitValue = useCallback(
    (habitId: string): HabitValue => {
      return dayRecord[habitId] ?? false;
    },
    [dayRecord]
  );

  const updateDayRecord = useCallback(
    (updater: (prev: DayRecord) => DayRecord) => {
      setTrackerState((prev) => ({
        ...prev,
        [currentDay]: updater(prev[currentDay] || {}),
      }));
      // Mark this day as "just modified" for smart sync
      setDayUpdatedAt((prev) => ({
        ...prev,
        [currentDay]: new Date().toISOString(),
      }));
    },
    [currentDay, setTrackerState, setDayUpdatedAt]
  );

  const toggleHabit = useCallback(
    (habitId: string) => {
      updateDayRecord((prev) => ({
        ...prev,
        [habitId]: !prev[habitId],
      }));
    },
    [updateDayRecord]
  );

  const setHabitValue = useCallback(
    (habitId: string, value: number) => {
      updateDayRecord((prev) => ({
        ...prev,
        [habitId]: Math.max(0, value),
      }));
    },
    [updateDayRecord]
  );

  // Set of valid habit IDs to ignore removed habits
  const validHabitIds = useMemo(() => {
    const ids = new Set<string>();
    categories.forEach((cat) => cat.items.forEach((item) => ids.add(item.id)));
    return ids;
  }, [categories]);

  // Total habits count
  const totalHabits = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.items.length, 0),
    [categories]
  );

  // Completed habits for current day
  const completedHabits = useMemo(
    () => countCompletedInDay(dayRecord, validHabitIds),
    [dayRecord, validHabitIds]
  );

  // Today's progress (0–1)
  const todayProgress = totalHabits > 0 ? completedHabits / totalHabits : 0;

  // Streak
  const streak = useMemo(
    () => computeStreak(trackerState, currentDay, validHabitIds),
    [trackerState, currentDay, validHabitIds]
  );

  // Block completion status (for confetti triggers)
  const blockCompletion = useMemo(() => {
    const result: Record<string, boolean> = {};
    for (const category of categories) {
      const allCompleted = category.items.every((item) =>
        isHabitCompleted(dayRecord[item.id])
      );
      result[category.id] = allCompleted;
    }
    return result;
  }, [dayRecord, categories]);

  return {
    currentDay,
    setCurrentDay,
    trackerState,
    setTrackerState,
    dayUpdatedAt,
    setDayUpdatedAt,
    toggleHabit,
    setHabitValue,
    getHabitValue,
    todayProgress,
    streak,
    blockCompletion,
    totalHabits,
    completedHabits,
  };
}
