"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Minus } from "lucide-react";
import { TOTAL_DAYS } from "@/constants/habits";
import type { TrackerState } from "@/hooks/useHabitTracker";
import { isHabitCompleted } from "@/hooks/useHabitTracker";

interface HabitDetailModalProps {
  isOpen: boolean;
  label: string;
  habitId: string;
  trackerState: TrackerState;
  onClose: () => void;
}

export default function HabitDetailModal({
  isOpen,
  label,
  habitId,
  trackerState,
  onClose,
}: HabitDetailModalProps) {
  // Compute daily status for this habit
  const dailyStatus = Array.from({ length: TOTAL_DAYS }, (_, d) => {
    const record = trackerState[d];
    if (!record) return { completed: false, value: undefined as (boolean | number | undefined) };
    const val = record[habitId];
    return { completed: isHabitCompleted(val), value: val };
  });

  const completedDays = dailyStatus.filter((d) => d.completed).length;
  const activeDays = dailyStatus.filter((d) => d.value !== undefined).length;
  const rate = activeDays > 0 ? completedDays / activeDays : 0;

  // Find best streak
  let bestStreak = 0;
  let currentStreak = 0;
  for (const day of dailyStatus) {
    if (day.completed) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

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
            className="relative z-10 w-full max-w-sm rounded-t-3xl border border-theme-border bg-theme-card p-5 shadow-2xl sm:rounded-3xl"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-theme-primary">
                {label}
              </h3>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
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

            {/* Day-by-day grid */}
            <div className="mb-2">
              <p className="mb-2 text-xs font-medium text-theme-secondary">
                الأداء اليومي
              </p>
              <div className="grid grid-cols-10 gap-1.5" dir="ltr">
                {dailyStatus.map((day, i) => (
                  <motion.div
                    key={i}
                    className={`flex aspect-square items-center justify-center rounded-lg transition-colors ${
                      day.completed
                        ? "bg-emerald-500/20"
                        : day.value !== undefined
                          ? "bg-red-500/10"
                          : "bg-theme-subtle"
                    }`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.015, duration: 0.15 }}
                  >
                    {day.completed ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : day.value !== undefined ? (
                      <Minus className="h-3 w-3 text-red-400/60" />
                    ) : (
                      <span className="text-[8px] text-theme-secondary/40">
                        {i + 1}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bar chart — completion by day */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-theme-secondary">
                مخطط الأيام
              </p>
              <div className="flex items-end gap-[3px]" dir="ltr" style={{ height: 64 }}>
                {dailyStatus.map((day, i) => {
                  const barValue = day.completed ? 1 : day.value !== undefined ? 0.15 : 0.05;
                  return (
                    <motion.div
                      key={i}
                      className={`flex-1 rounded-t transition-colors ${
                        day.completed
                          ? "bg-emerald-500/70"
                          : day.value !== undefined
                            ? "bg-red-500/20"
                            : "bg-theme-subtle"
                      }`}
                      initial={{ height: 0 }}
                      animate={{ height: `${barValue * 100}%` }}
                      transition={{ delay: i * 0.02, duration: 0.3, ease: "easeOut" }}
                    />
                  );
                })}
              </div>
              <div className="mt-1 flex justify-between" dir="ltr">
                <span className="text-[9px] text-theme-secondary/50">1</span>
                <span className="text-[9px] text-theme-secondary/50">15</span>
                <span className="text-[9px] text-theme-secondary/50">30</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-theme-subtle py-2.5">
      <span className="text-base font-bold text-theme-primary">{value}</span>
      <span className="text-[10px] text-theme-secondary">{label}</span>
    </div>
  );
}
