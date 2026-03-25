"use client";

import { motion } from "framer-motion";

interface WeekDayButtonProps {
  dayIndex: number;
  hijriShortStr: string;
  gregorianDayNumber: number;
  dayNameShort: string;
  isActive: boolean;
  isToday: boolean;
  isInRange: boolean;
  isFuture: boolean;
  hasActivity: boolean;
  onSelect: (day: number) => void;
}

export default function WeekDayButton({
  dayIndex,
  hijriShortStr,
  gregorianDayNumber,
  dayNameShort,
  isActive,
  isToday,
  isInRange,
  isFuture,
  hasActivity,
  onSelect,
}: WeekDayButtonProps) {
  // We no longer restrict clicks, everything is interactive:
  const isOutOfRange = !isInRange;

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => onSelect(dayIndex)}
      className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-[16px] transition-all cursor-pointer ${resolveStyle(isActive, isOutOfRange, hasActivity, isToday)}`}
    >
      {/* Day name label */}
      <span
        className={`text-[10px] font-semibold leading-none mb-0.5 ${
          isActive
            ? "text-stone-950"
            : isOutOfRange
              ? "text-theme-secondary/40"
              : "text-theme-secondary/80"
        }`}
      >
        {dayNameShort}
      </span>

      {/* Gregorian Number */}
      <span className={`text-[14px] font-bold leading-none ${isActive ? "text-stone-950" : ""}`}>{gregorianDayNumber}</span>
      
      {/* Hijri Number */}
      <span className={`text-[10px] font-medium leading-tight mt-0.5 ${
        isActive ? "text-stone-950 font-bold" : isOutOfRange ? "text-theme-secondary/50" : "text-theme-secondary"
      }`}>
        {hijriShortStr}
      </span>

      {/* Activity dot indicator */}
      {hasActivity && !isActive && !isToday && (
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
      )}
    </motion.button>
  );
}

/* ─── Style resolver ───────────────── */

function resolveStyle(isActive: boolean, isOutOfRange: boolean, hasActivity: boolean, isToday: boolean): string {
  if (isActive) {
    return "bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/40 ring-2 ring-amber-400";
  }
  if (isToday) {
    return "ring-2 ring-amber-400/60 text-theme-primary bg-amber-500/10";
  }
  if (hasActivity) {
    return "bg-emerald-500/10 ring-1 ring-emerald-500/20 text-theme-primary";
  }
  if (isOutOfRange) {
    return "text-theme-secondary/50 hover:bg-theme-subtle hover:text-theme-primary/70";
  }
  return "text-theme-primary hover:bg-theme-subtle";
}
