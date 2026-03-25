"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RAMADAN_START_DATE } from "@/constants/habits";
import { trackDaySelect } from "@/utils/analytics";
import { getRamadanDay } from "@/utils/date";
import { getHijriDateForDay, formatHijriDateAr, getHijriShortStr } from "@/utils/hijri";
import { useWeekSelector } from "@/hooks/useWeekSelector";
import WeekDayButton from "@/components/WeekDayButton";

interface DaySelectorProps {
  currentDay: number;
  onSelectDay: (day: number) => void;
  trackerState: Record<number, Record<string, boolean | number>>;
}

export default function DaySelector({
  currentDay,
  onSelectDay,
  trackerState,
}: DaySelectorProps) {
  const currentRamadanDay = getRamadanDay(RAMADAN_START_DATE);
  // 0-based index of today (independent of which day is selected)
  const todayDayIndex = currentRamadanDay - 1;

  // (Previously, there was an effect here restricting navigation forward)

  const {
    weekDays,
    weekOffset,
    canGoBack,
    canGoForward,
    goToPreviousWeek,
    goToNextWeek,
  } = useWeekSelector(currentDay, onSelectDay);

  const hijriInfo = getHijriDateForDay(currentDay);
  const hijriDateStr = formatHijriDateAr(hijriInfo);

  const gregorianStr = new Intl.DateTimeFormat("ar", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(hijriInfo.gregorianDate);

  const hasDayActivity = (day: number): boolean => {
    const record = trackerState[day];
    if (!record) return false;
    return Object.values(record).some((v) =>
      typeof v === "boolean" ? v : v > 0,
    );
  };

  const handleSelectDay = (day: number) => {
    trackDaySelect(day);
    onSelectDay(day);
  };

  return (
    <div className="mx-4 my-3 overflow-hidden rounded-2xl bg-theme-card">
      {/* Header: Date info + navigation arrows */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-theme-primary">{gregorianStr}</p>
          <p className="text-xs text-theme-secondary">{hijriDateStr}</p>
        </div>
        <div className="flex items-center gap-1">
          <NavButton onClick={goToPreviousWeek} disabled={!canGoBack} aria-label="Previous week">
            <ChevronRight className="h-4 w-4" />
          </NavButton>
          <NavButton onClick={goToNextWeek} disabled={!canGoForward} aria-label="Next week">
            <ChevronLeft className="h-4 w-4" />
          </NavButton>
        </div>
      </div>

      {/* Week day grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={weekOffset}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="grid grid-cols-7 gap-1 px-3 pb-4 pt-2"
        >
          {weekDays.map((day) => {
            const hInfo = getHijriDateForDay(day.dayIndex);
            const hShort = getHijriShortStr(hInfo);

            return (
              <WeekDayButton
                key={day.dayIndex}
                dayIndex={day.dayIndex}
                hijriShortStr={hShort}
                gregorianDayNumber={day.gregorianDate.getDate()}
                dayNameShort={day.dayNameShort}
                isActive={day.dayIndex === currentDay}
                isToday={day.dayIndex === todayDayIndex}
                isInRange={day.isInRange}
                isFuture={day.dayNumber > currentRamadanDay}
                hasActivity={day.isInRange && hasDayActivity(day.dayIndex)}
                onSelect={handleSelectDay}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── Navigation Button ───────────────── */

interface NavButtonProps {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  "aria-label": string;
}

function NavButton({ onClick, disabled, children, "aria-label": ariaLabel }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`flex h-8 w-8 items-center justify-center rounded-full cursor-pointer transition-all ${
        disabled
          ? "cursor-not-allowed text-theme-secondary/30"
          : "text-theme-secondary hover:bg-theme-subtle active:scale-90"
      }`}
    >
      {children}
    </button>
  );
}
