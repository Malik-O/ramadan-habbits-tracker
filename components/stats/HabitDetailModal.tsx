"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { TrackerState } from "@/hooks/useHabitTracker";
import { isHabitCompleted } from "@/hooks/useHabitTracker";
import DailyHeatmap from "./DailyHeatmap";

// ─── Types ───────────────────────────────────────────────────────

interface HabitDetailModalProps {
  isOpen: boolean;
  label: string;
  habitId: string;
  goal?: number;
  trackerState: TrackerState;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────

export default function HabitDetailModal({
  isOpen,
  label,
  habitId,
  goal,
  trackerState,
  onClose,
}: HabitDetailModalProps) {
  // Build daily completions for this specific habit using the exact same day index format DailyHeatmap expects
  const dailyCompletions = useMemo(() => {
    const completions: { day: number; value: number }[] = [];
    for (const [dayKey, record] of Object.entries(trackerState)) {
      const day = Number(dayKey);
      if (!isNaN(day) && record) {
        const val = record[habitId];
        if (val !== undefined) {
          completions.push({
            day,
            value: isHabitCompleted(val, goal) ? 1 : 0,
          });
        }
      }
    }
    return completions;
  }, [trackerState, habitId]);

  const completedDays = useMemo(
    () => dailyCompletions.filter((c) => c.value === 1).length,
    [dailyCompletions]
  );
  
  const activeDays = dailyCompletions.length;
  const rate = activeDays > 0 ? completedDays / activeDays : 0;

  // Best streak across the entire tracker for this specific habit
  const bestStreak = useMemo(() => {
    const allDayIndices = Object.keys(trackerState)
      .map(Number)
      .sort((a, b) => a - b);
    let best = 0;
    let cur = 0;
    let prev = -2;
    for (const d of allDayIndices) {
      const record = trackerState[d];
      if (isHabitCompleted(record?.[habitId], goal)) {
        cur = d === prev + 1 ? cur + 1 : 1;
        best = Math.max(best, cur);
      } else {
        cur = 0;
      }
      prev = d;
    }
    return best;
  }, [trackerState, habitId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-full rounded-t-3xl border border-theme-border bg-theme-bg p-5 shadow-2xl sm:max-w-sm sm:rounded-3xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Handle for mobile */}
            <div className="absolute left-1/2 top-2 h-1 w-12 -translate-x-1/2 rounded-full bg-theme-border sm:hidden" />

            {/* Header */}
            <div className="mb-4 mt-2 flex items-center justify-between">
              <h3 className="text-base font-semibold text-theme-primary">{label}</h3>
              <button
                onClick={onClose}
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
              >
                <X className="h-4 w-4 text-theme-secondary" />
              </button>
            </div>

            {/* Stats summary */}
            <div className="mb-4 grid grid-cols-3 gap-2">
              <MiniStat label="نسبة الإنجاز" value={`${Math.round(rate * 100)}%`} />
              <MiniStat label="أيام مكتملة" value={`${completedDays}`} />
              <MiniStat label="أفضل تتالي" value={`${bestStreak}`} />
            </div>

            {/* Reused generic DailyHeatmap */}
            <div className="-mx-1">
              <DailyHeatmap dailyCompletions={dailyCompletions} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── MiniStat ────────────────────────────────────────────────────

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-theme-subtle py-2.5">
      <span className="text-base font-bold text-theme-primary">{value}</span>
      <span className="text-[10px] text-theme-secondary">{label}</span>
    </div>
  );
}
