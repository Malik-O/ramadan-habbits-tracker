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
  const isOutOfRange = !isInRange;

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={() => onSelect(dayIndex)}
      className={`relative flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all cursor-pointer ${resolveStyle(isActive, isOutOfRange, hasActivity, isToday)}`}
    >
      {/* Day name label */}
      <span
        className={`text-[10px] font-medium leading-none mb-0.5 ${
          isActive
            ? "text-stone-950"
            : isOutOfRange
              ? "text-theme-secondary/30"
              : "text-theme-secondary/70"
        }`}
      >
        {dayNameShort}
      </span>

      {/* Gregorian Number */}
      <span className={`text-[14px] font-bold leading-none ${isActive ? "text-stone-950" : ""}`}>
        {gregorianDayNumber}
      </span>
      
      {/* Hijri Number */}
      <span className={`text-[10px] font-medium leading-tight mt-0.5 ${
        isActive ? "text-stone-950/70" : isOutOfRange ? "text-theme-secondary/30" : "text-theme-secondary/60"
      }`}>
        {hijriShortStr}
      </span>

      {/* Activity dot indicator */}
      {hasActivity && !isActive && !isToday && (
        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
      )}
    </motion.button>
  );
}

/* ─── Style resolver ───────────────── */

function resolveStyle(isActive: boolean, isOutOfRange: boolean, hasActivity: boolean, isToday: boolean): string {
  if (isActive) {
    return "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/25";
  }
  if (isToday) {
    return "ring-1.5 ring-amber-500/40 text-theme-primary bg-amber-500/8";
  }
  if (hasActivity) {
    return "bg-emerald-500/8 text-theme-primary";
  }
  if (isOutOfRange) {
    return "text-theme-secondary/40 hover:bg-theme-subtle/50";
  }
  return "text-theme-primary hover:bg-theme-subtle";
}
