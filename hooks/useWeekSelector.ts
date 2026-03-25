import { useMemo, useCallback, useState, useEffect } from "react";
import { TOTAL_DAYS, RAMADAN_START_DATE } from "@/constants/habits";
import { getGregorianDateForDay } from "@/utils/hijri";

interface WeekDay {
  dayIndex: number;       // 0-based Ramadan day index
  dayNumber: number;      // 1-based Ramadan day number
  gregorianDate: Date;
  dayOfWeek: number;      // 0=Sun ... 6=Sat
  dayNameShort: string;   // "Mon", "Tue", etc.
  isInRange: boolean;     // Whether this day falls within the 30-day Ramadan range
}

interface UseWeekSelectorReturn {
  weekDays: WeekDay[];
  weekOffset: number;
  canGoBack: boolean;
  canGoForward: boolean;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  getWeekOffsetForDay: (dayIndex: number) => number;
}

const DAY_NAMES_AR = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

/**
 * Returns the Saturday-aligned week offset for a given Ramadan day index.
 * The week starts on Saturday.
 */
function computeWeekOffset(dayIndex: number): number {
  const date = getGregorianDateForDay(dayIndex);
  const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
  // Calculate days since Saturday:
  // If Sat (6) -> 0, Sun (0) -> 1, Mon (1) -> 2, etc.
  const daysSinceSaturday = (dayOfWeek + 1) % 7;
  return dayIndex - daysSinceSaturday;
}

/**
 * Hook to manage week-based navigation across Ramadan days.
 */
export function useWeekSelector(
  currentDay: number,
  onSelectDay: (day: number) => void,
): UseWeekSelectorReturn {
  const [weekOffset, setWeekOffset] = useState<number>(() => computeWeekOffset(currentDay));

  // Sync displayed week if currentDay changes externally (or when manually selected)
  useEffect(() => {
    setWeekOffset(computeWeekOffset(currentDay));
  }, [currentDay]);

  const weekDays = useMemo((): WeekDay[] => {
    return Array.from({ length: 7 }, (_, i) => {
      const dayIndex = weekOffset + i;
      const gregorianDate = new Date(RAMADAN_START_DATE);
      gregorianDate.setDate(gregorianDate.getDate() + dayIndex);

      const dayOfWeek = gregorianDate.getDay();

      return {
        dayIndex,
        dayNumber: dayIndex + 1,
        gregorianDate,
        dayOfWeek,
        dayNameShort: DAY_NAMES_AR[dayOfWeek],
        isInRange: dayIndex >= 0 && dayIndex < TOTAL_DAYS,
      };
    });
  }, [weekOffset]);

  // Allow infinite navigation
  const canGoBack = true;
  const canGoForward = true;

  const goToPreviousWeek = useCallback(() => {
    setWeekOffset((prev) => prev - 7);
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekOffset((prev) => prev + 7);
  }, []);

  const getWeekOffsetForDay = useCallback(
    (dayIndex: number) => computeWeekOffset(dayIndex),
    [],
  );

  return {
    weekDays,
    weekOffset,
    canGoBack,
    canGoForward,
    goToPreviousWeek,
    goToNextWeek,
    getWeekOffsetForDay,
  };
}
