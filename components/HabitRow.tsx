"use client";

import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import type { HabitValue } from "@/hooks/useHabitTracker";

interface HabitRowProps {
  label: string;
  type: "boolean" | "number";
  value: HabitValue;
  onToggle: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function HabitRow({
  label,
  type,
  value,
  onToggle,
  onIncrement,
  onDecrement,
}: HabitRowProps) {
  const isChecked = typeof value === "boolean" ? value : (value as number) > 0;

  return (
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
            ? "text-emerald-400 line-through opacity-70"
            : "text-slate-200"
        }`}
      >
        {label}
      </span>

      {/* Toggle / stepper */}
      {type === "boolean" ? (
        <BooleanToggle checked={value as boolean} onToggle={onToggle} />
      ) : (
        <NumberStepper
          value={value as number}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      )}
    </motion.div>
  );
}

/** Pill-shaped boolean toggle */
function BooleanToggle({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors ${
        checked ? "bg-emerald-500" : "bg-white/10"
      }`}
      aria-label="Toggle habit"
    >
      <motion.div
        className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md"
        animate={{ left: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

/** Number stepper with −/+ buttons */
function NumberStepper({
  value,
  onIncrement,
  onDecrement,
}: {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const numValue = value || 0;

  return (
    <div className="flex flex-shrink-0 items-center gap-1">
      <button
        onClick={onDecrement}
        disabled={numValue <= 0}
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-slate-400 transition-colors hover:bg-white/20 disabled:opacity-30"
        aria-label="Decrease"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span
        className={`min-w-[28px] text-center text-sm font-bold ${
          numValue > 0 ? "text-amber-400" : "text-slate-500"
        }`}
      >
        {numValue}
      </span>
      <button
        onClick={onIncrement}
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-slate-400 transition-colors hover:bg-white/20"
        aria-label="Increase"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
