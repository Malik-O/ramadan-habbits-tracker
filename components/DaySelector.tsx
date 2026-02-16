"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { TOTAL_DAYS } from "@/constants/habits";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll to active day on mount
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = activeRef.current;
      const scrollLeft =
        element.offsetLeft - container.clientWidth / 2 + element.clientWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [currentDay]);

  const hasDayActivity = (day: number): boolean => {
    const record = trackerState[day];
    if (!record) return false;
    return Object.values(record).some((v) =>
      typeof v === "boolean" ? v : v > 0
    );
  };

  return (
    <div
      ref={scrollRef}
      className="hide-scrollbar flex gap-2 overflow-x-auto px-4 py-3"
      dir="ltr"
    >
      {Array.from({ length: TOTAL_DAYS }, (_, i) => {
        const isActive = i === currentDay;
        const hasActivity = hasDayActivity(i);

        return (
          <motion.button
            key={i}
            ref={isActive ? activeRef : null}
            onClick={() => onSelectDay(i)}
            whileTap={{ scale: 0.9 }}
            className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all ${
              isActive
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25"
                : hasActivity
                  ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            {i + 1}
            {hasActivity && !isActive && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
