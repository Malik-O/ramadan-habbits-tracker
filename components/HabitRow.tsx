"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import type { HabitValue } from "@/hooks/useHabitTracker";
import AnimatedCheckbox from "./AnimatedCheckbox";
import NumpadModal from "./NumpadModal";

interface HabitRowProps {
  label: string;
  type: "boolean" | "number";
  value: HabitValue;
  goal?: number;
  repeat?: string;
  onToggle: () => void;
  onSetValue: (value: number) => void;
  /** Group names this habit belongs to (for badge display) */
  groupNames?: string[];
}

export default function HabitRow({
  label,
  type,
  value,
  goal,
  repeat,
  onToggle,
  onSetValue,
  groupNames,
}: HabitRowProps) {
  const [isNumpadOpen, setIsNumpadOpen] = useState(false);
  
  // A number habit is considered 'checked' if value >= goal (if goal exists) else if value > 0
  const numericValue = (value as number) || 0;
  const isChecked = type === "boolean" 
    ? (value as boolean) 
    : (goal ? numericValue >= goal : numericValue > 0);

  const handleLabelClick = () => {
    if (type === "boolean") {
      onToggle();
    } else {
      setIsNumpadOpen(true);
    }
  };

  return (
    <>
      <motion.div
        className="flex items-center justify-between gap-3 px-4 py-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Habit label + group badges */}
        <div
          onClick={handleLabelClick}
          className="flex flex-1 cursor-pointer flex-col gap-0.5 overflow-hidden"
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`text-sm leading-relaxed transition-all flex items-center gap-1.5 ${
                isChecked
                  ? "text-emerald-500 font-medium"
                  : "text-theme-primary"
              }`}
            >
              <AnimatePresence mode="popLayout">
                {isChecked && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </motion.span>
                )}
              </AnimatePresence>
              {label}
            </span>
            <RepeatBadge repeat={repeat} />
            <GroupBadges groupNames={groupNames} />
          </div>
        </div>

        {/* Checkbox or counter */}
        {type === "boolean" ? (
          <AnimatedCheckbox checked={value as boolean} onToggle={onToggle} />
        ) : (
          <CounterDisplay
            value={numericValue}
            goal={goal}
            onOpen={() => setIsNumpadOpen(true)}
          />
        )}
      </motion.div>

      {/* Numpad modal for number habits */}
      {type === "number" && (
        <NumpadModal
          isOpen={isNumpadOpen}
          label={label}
          currentValue={(value as number) || 0}
          onConfirm={onSetValue}
          onClose={() => setIsNumpadOpen(false)}
        />
      )}
    </>
  );
}

/** Tappable counter display that opens the numpad */
function CounterDisplay({
  value,
  goal,
  onOpen,
}: {
  value: number;
  goal?: number;
  onOpen: () => void;
}) {
  const isCompleted = goal ? value >= goal : value > 0;
  
  return (
    <motion.button
      onClick={onOpen}
      whileTap={{ scale: 0.9 }}
      className={`flex h-8 min-w-[44px] items-center justify-center rounded-xl border px-3 transition-all ${
        isCompleted
          ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
          : "border-theme-border bg-theme-subtle text-theme-secondary"
      }`}
    >
      <span className="text-sm font-bold tabular-nums">
        {value}
        {goal && <span className="text-[10px] text-theme-secondary ml-0.5">/{goal}</span>}
      </span>
    </motion.button>
  );
}

const REPEAT_LABELS: Record<string, string> = {
  daily: "يومياً",
  weekly: "أسبوعياً",
  biweekly: "كل أسبوعين",
  monthly: "شهرياً",
  yearly: "سنوياً",
};

/** Small repeat frequency badge shown below the habit label (only for non-daily habits) */
function RepeatBadge({ repeat }: { repeat?: string }) {
  if (!repeat || repeat === "daily") return null;
  return (
    <span className="inline-flex w-fit rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-medium leading-none text-violet-400">
      {REPEAT_LABELS[repeat] ?? repeat}
    </span>
  );
}

/** Renders group source badges next to a habit label */
const MAX_VISIBLE_BADGES = 2;

function GroupBadges({ groupNames }: { groupNames?: string[] }) {
  if (!groupNames || groupNames.length === 0) return null;

  const visible = groupNames.slice(0, MAX_VISIBLE_BADGES);
  const overflow = groupNames.length - MAX_VISIBLE_BADGES;

  return (
    <span className="flex flex-shrink-0 items-center gap-0.5">
      {visible.map((name) => (
        <span
          key={name}
          className="inline-flex items-center gap-0.5 rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-indigo-500"
          title={name}
        >
          <UsersIcon />
          <span className="max-w-[56px] truncate">{name}</span>
        </span>
      ))}
      {overflow > 0 && (
        <span
          className="rounded-md bg-indigo-500/10 px-1 py-0.5 text-[9px] font-semibold leading-none text-indigo-400"
          title={groupNames.slice(MAX_VISIBLE_BADGES).join("، ")}
        >
          +{overflow}
        </span>
      )}
    </span>
  );
}

/** Tiny inline SVG icon — avoids importing lucide just for a 10px icon */
function UsersIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
