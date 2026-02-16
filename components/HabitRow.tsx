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
}

export default function HabitRow({
  label,
  type,
  value,
  onToggle,
  onSetValue,
}: HabitRowProps) {
  const [isNumpadOpen, setIsNumpadOpen] = useState(false);
  const isChecked = typeof value === "boolean" ? value : (value as number) > 0;

  return (
    <>
      <motion.div
        className="flex items-center justify-between gap-3 px-4 py-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Habit label */}
        <span
          className={`flex-1 text-sm leading-relaxed transition-all ${
            isChecked
              ? "text-emerald-500 line-through opacity-70"
              : "text-theme-primary"
          }`}
        >
          {label}
        </span>

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
          ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
          : "border-theme-border bg-theme-subtle text-theme-secondary"
      }`}
    >
      <span className="text-sm font-bold tabular-nums">{value}</span>
    </motion.button>
  );
}
