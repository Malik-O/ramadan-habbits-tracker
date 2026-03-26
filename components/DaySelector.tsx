"use client";

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
  const todayDayIndex = currentRamadanDay - 1;

  const {
    weekDays,
    weekOffset,
    navDirection,
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
    <div className="border-b border-theme-border">
      {/* Header: Date info + navigation arrows */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-theme-primary">{gregorianStr}</p>
          <p className="text-[11px] text-theme-secondary">{hijriDateStr}</p>
        </div>
        <div className="flex items-center gap-0.5">
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
          initial={{ opacity: 0, x: navDirection * -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: navDirection * 40 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="grid grid-cols-7 gap-1 px-3 pb-3 pt-1"
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
      className={`flex h-7 w-7 items-center justify-center rounded-lg cursor-pointer transition-all ${
        disabled
          ? "cursor-not-allowed text-theme-secondary/30"
          : "text-theme-secondary hover:bg-theme-subtle hover:text-theme-primary active:scale-90"
      }`}
    >
      {children}
    </button>
  );
}
