"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { HabitValue } from "@/hooks/useHabitTracker";
import AnimatedCheckbox from "./AnimatedCheckbox";
import NumpadModal from "./NumpadModal";

interface HabitRowProps {
  label: string;
  type: "boolean" | "number";
  value: HabitValue;
  onToggle: () => void;
  onSetValue: (value: number) => void;
  /** Group names this habit belongs to (for badge display) */
  groupNames?: string[];
}

export default function HabitRow({
  label,
  type,
  value,
  onToggle,
  onSetValue,
  groupNames,
}: HabitRowProps) {
  const [isNumpadOpen, setIsNumpadOpen] = useState(false);
  const isChecked = typeof value === "boolean" ? value : (value as number) > 0;

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
          className="flex flex-1 cursor-pointer items-center gap-1.5 overflow-hidden"
        >
          <span
            className={`text-sm leading-relaxed transition-all ${
              isChecked
                ? "text-emerald-500 line-through opacity-70"
                : "text-theme-primary"
            }`}
          >
            {label}
          </span>
          <GroupBadges groupNames={groupNames} />
        </div>

        {/* Checkbox or counter */}
        {type === "boolean" ? (
          <AnimatedCheckbox checked={value as boolean} onToggle={onToggle} />
        ) : (
          <CounterDisplay
            value={(value as number) || 0}
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
  onOpen,
}: {
  value: number;
  onOpen: () => void;
}) {
  return (
    <motion.button
      onClick={onOpen}
      whileTap={{ scale: 0.9 }}
      className={`flex h-8 min-w-[44px] items-center justify-center rounded-xl border px-3 transition-all ${
        value > 0
          ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
          : "border-theme-border bg-theme-subtle text-theme-secondary"
      }`}
    >
      <span className="text-sm font-bold tabular-nums">{value}</span>
    </motion.button>
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
