"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Heart,
  Check,
} from "lucide-react";
import type { HabitCategory } from "@/constants/habits";
import type { HabitValue } from "@/hooks/useHabitTracker";
import HabitRow from "./HabitRow";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Heart,
};

interface HabitBlockProps {
  category: HabitCategory;
  isDefaultOpen: boolean;
  isCompleted: boolean;
  getHabitValue: (id: string) => HabitValue;
  toggleHabit: (id: string) => void;
  setHabitValue: (id: string, value: number) => void;
}

function isItemCompleted(value: HabitValue): boolean {
  if (typeof value === "boolean") return value;
  return (value as number) > 0;
}

export default function HabitBlock({
  category,
  isDefaultOpen,
  isCompleted,
  getHabitValue,
  toggleHabit,
  setHabitValue,
}: HabitBlockProps) {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);
  const IconComponent = ICON_MAP[category.icon] || Heart;

  const completedCount = category.items.filter((item) =>
    isItemCompleted(getHabitValue(item.id))
  ).length;
  const totalCount = category.items.length;

  return (
    <motion.div
      className={`mx-4 overflow-hidden rounded-2xl border transition-colors ${
        isCompleted
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-theme-border bg-theme-card"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Accordion header */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5"
      >
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            isCompleted ? "bg-emerald-500/20" : "bg-amber-500/10"
          }`}
        >
          {isCompleted ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <IconComponent className="h-4 w-4 text-amber-400" />
          )}
        </div>

        <div className="flex flex-1 flex-col items-start gap-0.5">
          <span className="text-sm font-semibold text-theme-primary">
            {category.name}
          </span>
          {/* Micro progress bar */}
          <div className="h-1 w-full max-w-[120px] overflow-hidden rounded-full bg-theme-subtle">
            <motion.div
              className={`h-full rounded-full ${
                isCompleted ? "bg-emerald-500" : "bg-amber-500"
              }`}
              initial={{ width: 0 }}
              animate={{
                width: `${(completedCount / totalCount) * 100}%`,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        <span className="text-xs font-medium text-theme-secondary">
          {completedCount}/{totalCount}
        </span>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-theme-secondary" />
        </motion.div>
      </button>

      {/* Accordion body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-theme-border pb-2">
              {category.items.map((item) => (
                <HabitRow
                  key={item.id}
                  label={item.label}
                  type={item.type}
                  value={getHabitValue(item.id)}
                  onToggle={() => toggleHabit(item.id)}
                  onSetValue={(val) => setHabitValue(item.id, val)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
