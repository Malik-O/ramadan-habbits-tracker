"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import type { HabitCategory } from "@/constants/habits";
import type { HabitValue } from "@/hooks/useHabitTracker";
import { getIconComponent } from "@/utils/iconMap";
import {
  trackBlockToggle,
  trackHabitToggle,
  trackHabitValueSet,
} from "@/utils/analytics";
import HabitRow from "./HabitRow";

interface HabitBlockProps {
  category: HabitCategory;
  isDefaultOpen: boolean;
  isCompleted: boolean;
  getHabitValue: (id: string) => HabitValue;
  toggleHabit: (id: string) => void;
  setHabitValue: (id: string, value: number) => void;
  /** Optional: returns group names for a habit (for badge display) */
  getGroupNames?: (categoryName: string, habitLabel: string) => string[];
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
  getGroupNames,
}: HabitBlockProps) {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);
  const IconComponent = getIconComponent(category.icon);

  const completedCount = category.items.filter((item) =>
    isItemCompleted(getHabitValue(item.id))
  ).length;
  const totalCount = category.items.length;

  const handleToggleBlock = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      trackBlockToggle(category.id, newState);
      return newState;
    });
  }, [category.id]);

  const handleToggleHabit = useCallback(
    (id: string) => {
      toggleHabit(id);
      // We don't know the *new* value here easily without async state,
      // but we know it's a toggle. We can assume we are "doing" it if it wasn't done.
      // But accurate tracking might require reading the current value first.
      const currentValue = getHabitValue(id);
      const isNowCompleted = !isItemCompleted(currentValue);
      trackHabitToggle(id, isNowCompleted);
    },
    [toggleHabit, getHabitValue]
  );

  const handleSetHabitValue = useCallback(
    (id: string, value: number) => {
      setHabitValue(id, value);
      trackHabitValueSet(id, value);
    },
    [setHabitValue]
  );

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
        onClick={handleToggleBlock}
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
            <IconComponent className="h-4 w-4 text-amber-500" />
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
                  onToggle={() => handleToggleHabit(item.id)}
                  onSetValue={(val) => handleSetHabitValue(item.id, val)}
                  groupNames={getGroupNames?.(category.name, item.label)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
