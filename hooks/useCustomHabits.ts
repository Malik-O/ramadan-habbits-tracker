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

  const addCategory = useCallback(
    (name: string, icon: string) => {
      setCategories((prev) => [
        ...prev,
        { id: generateId(), name, icon, items: [] },
      ]);
    },
    [setCategories]
  );

  const updateCategory = useCallback(
    (categoryId: string, name: string, icon: string) => {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, name, icon } : cat
        )
      );
    },
    [setCategories]
  );

  const removeCategory = useCallback(
    (categoryId: string) => {
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    },
    [setCategories]
  );

  const reorderCategories = useCallback(
    (fromIndex: number, toIndex: number) => {
      setCategories((prev) => {
        const result = [...prev];
        const [removed] = result.splice(fromIndex, 1);
        result.splice(toIndex, 0, removed);
        return result;
      });
    },
    [setCategories]
  );

  const addHabit = useCallback(
    (categoryId: string, label: string, type: "boolean" | "number") => {
      const newHabit: HabitItem = { id: generateId(), label, type };
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, items: [...cat.items, newHabit] }
            : cat
        )
      );
    },
    [setCategories]
  );

  const updateHabit = useCallback(
    (categoryId: string, habitId: string, label: string, type: "boolean" | "number") => {
      setCategories((prev) =>
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
    [setCategories]
  );

  const removeHabit = useCallback(
    (categoryId: string, habitId: string) => {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, items: cat.items.filter((item) => item.id !== habitId) }
            : cat
        )
      );
    },
    [setCategories]
  );

  const resetToDefaults = useCallback(() => {
    setCategories(HABIT_CATEGORIES);
  }, [setCategories]);

  return {
    categories,
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
