"use client";

import { useCallback } from "react";
import { HABIT_CATEGORIES, type HabitCategory, type HabitItem } from "@/constants/habits";
import { useLocalStorage } from "./useLocalStorage";

/** Generates a short unique ID */
function generateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface UseCustomHabitsReturn {
  categories: HabitCategory[];
  setCategories: (habits: HabitCategory[]) => void;
  customHabitsUpdatedAt: string;
  setCustomHabitsUpdatedAt: (ts: string) => void;
  addCategory: (name: string, icon: string) => void;
  updateCategory: (categoryId: string, name: string, icon: string) => void;
  removeCategory: (categoryId: string) => void;
  reorderCategories: (fromIndex: number, toIndex: number) => void;
  addHabit: (categoryId: string, label: string, type: "boolean" | "number") => void;
  updateHabit: (categoryId: string, habitId: string, label: string, type: "boolean" | "number") => void;
  removeHabit: (categoryId: string, habitId: string) => void;
  resetToDefaults: () => void;
}

export function useCustomHabits(): UseCustomHabitsReturn {
  const [categories, setCategories] = useLocalStorage<HabitCategory[]>(
    "hemma-custom-habits",
    HABIT_CATEGORIES
  );
  const [customHabitsUpdatedAt, setCustomHabitsUpdatedAt] = useLocalStorage<string>(
    "hemma-custom-habits-updated-at",
    ""
  );

  /** Helper: stamp the current time whenever categories change */
  const stampAndSet = useCallback(
    (updater: (prev: HabitCategory[]) => HabitCategory[]) => {
      setCategories(updater);
      setCustomHabitsUpdatedAt(new Date().toISOString());
    },
    [setCategories, setCustomHabitsUpdatedAt]
  );

  const addCategory = useCallback(
    (name: string, icon: string) => {
      stampAndSet((prev) => [
        ...prev,
        { id: generateId(), name, icon, items: [] },
      ]);
    },
    [stampAndSet]
  );

  const updateCategory = useCallback(
    (categoryId: string, name: string, icon: string) => {
      stampAndSet((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, name, icon } : cat
        )
      );
    },
    [stampAndSet]
  );

  const removeCategory = useCallback(
    (categoryId: string) => {
      stampAndSet((prev) => prev.filter((cat) => cat.id !== categoryId));
    },
    [stampAndSet]
  );

  const reorderCategories = useCallback(
    (fromIndex: number, toIndex: number) => {
      stampAndSet((prev) => {
        const result = [...prev];
        const [removed] = result.splice(fromIndex, 1);
        result.splice(toIndex, 0, removed);
        return result;
      });
    },
    [stampAndSet]
  );

  const addHabit = useCallback(
    (categoryId: string, label: string, type: "boolean" | "number") => {
      const newHabit: HabitItem = { id: generateId(), label, type };
      stampAndSet((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, items: [...cat.items, newHabit] }
            : cat
        )
      );
    },
    [stampAndSet]
  );

  const updateHabit = useCallback(
    (categoryId: string, habitId: string, label: string, type: "boolean" | "number") => {
      stampAndSet((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                items: cat.items.map((item) =>
                  item.id === habitId ? { ...item, label, type } : item
                ),
              }
            : cat
        )
      );
    },
    [stampAndSet]
  );

  const removeHabit = useCallback(
    (categoryId: string, habitId: string) => {
      stampAndSet((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, items: cat.items.filter((item) => item.id !== habitId) }
            : cat
        )
      );
    },
    [stampAndSet]
  );

  const resetToDefaults = useCallback(() => {
    stampAndSet(() => HABIT_CATEGORIES);
  }, [stampAndSet]);

  return {
    categories,
    setCategories,
    customHabitsUpdatedAt,
    setCustomHabitsUpdatedAt,
    addCategory,
    updateCategory,
    removeCategory,
    reorderCategories,
    addHabit,
    updateHabit,
    removeHabit,
    resetToDefaults,
  };
}
