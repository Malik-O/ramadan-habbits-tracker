"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { HabitCategory } from "@/constants/habits";
import type { TrackerState } from "@/hooks/useHabitTracker";
import { isHabitCompleted } from "@/hooks/useHabitTracker";
import { TOTAL_DAYS } from "@/constants/habits";
import HabitDetailModal from "./HabitDetailModal";

interface CategoryStat {
  category: HabitCategory;
  completed: number;
  possible: number;
  rate: number;
}

interface CategoryBreakdownProps {
  categoryStats: CategoryStat[];
  trackerState: TrackerState;
}

export default function CategoryBreakdown({
  categoryStats,
  trackerState,
}: CategoryBreakdownProps) {
  const [selectedHabit, setSelectedHabit] = useState<{
    id: string;
    label: string;
  } | null>(null);

  return (
    <>
      <div className="rounded-2xl border border-theme-border bg-theme-card">
        <h3 className="border-b border-theme-border px-4 py-3 text-sm font-semibold text-theme-primary">
          أداء الأقسام
        </h3>
        <div className="divide-y divide-theme-border">
          {categoryStats.map((stat) => (
            <CategoryStatRow
              key={stat.category.id}
              stat={stat}
              trackerState={trackerState}
              onSelectHabit={setSelectedHabit}
            />
          ))}
        </div>
      </div>

      {/* Habit detail modal */}
      <HabitDetailModal
        isOpen={!!selectedHabit}
        label={selectedHabit?.label ?? ""}
        habitId={selectedHabit?.id ?? ""}
        trackerState={trackerState}
        onClose={() => setSelectedHabit(null)}
      />
    </>
  );
}

interface CategoryStatRowProps {
  stat: CategoryStat;
  trackerState: TrackerState;
  onSelectHabit: (habit: { id: string; label: string }) => void;
}

function CategoryStatRow({ stat, trackerState, onSelectHabit }: CategoryStatRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      {/* Category row */}
      <button
        onClick={() => setIsExpanded((p) => !p)}
        className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-theme-subtle"
      >
        {/* Progress bar */}
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-theme-primary">
              {stat.category.name}
            </span>
            <span className="text-xs font-semibold text-amber-400">
              {Math.round(stat.rate * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-theme-subtle">
            <motion.div
              className={`h-full rounded-full ${
                stat.rate >= 0.8
                  ? "bg-emerald-500"
                  : stat.rate >= 0.5
                    ? "bg-amber-500"
                    : stat.rate > 0
                      ? "bg-orange-400"
                      : "bg-theme-subtle"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${stat.rate * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-theme-secondary" />
        </motion.div>
      </button>

      {/* Expanded: individual habit stats */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-theme-subtle/50 px-4 pb-3">
              {stat.category.items.map((item) => (
                <HabitStatRow
                  key={item.id}
                  label={item.label}
                  habitId={item.id}
                  trackerState={trackerState}
                  onSelect={() =>
                    onSelectHabit({ id: item.id, label: item.label })
                  }
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface HabitStatRowProps {
  label: string;
  habitId: string;
  trackerState: TrackerState;
  onSelect: () => void;
}

function HabitStatRow({ label, habitId, trackerState, onSelect }: HabitStatRowProps) {
  // Count days this habit was completed
  let completed = 0;
  let totalActive = 0;
  for (let d = 0; d < TOTAL_DAYS; d++) {
    const record = trackerState[d];
    if (record) {
      totalActive++;
      if (isHabitCompleted(record[habitId])) {
        completed++;
      }
    }
  }
  const rate = totalActive > 0 ? completed / totalActive : 0;

  return (
    <button
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-lg py-2 transition-colors hover:bg-theme-subtle"
    >
      <span className="flex-1 text-right text-xs text-theme-secondary">
        {label}
      </span>
      <div className="h-1 w-16 overflow-hidden rounded-full bg-theme-subtle">
        <motion.div
          className={`h-full rounded-full ${
            rate >= 0.8
              ? "bg-emerald-500"
              : rate >= 0.5
                ? "bg-amber-500"
                : rate > 0
                  ? "bg-orange-400"
                  : "bg-theme-subtle"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${rate * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <span className="w-8 text-left text-[11px] font-medium text-theme-secondary">
        {Math.round(rate * 100)}%
      </span>
    </button>
  );
}
