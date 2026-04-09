"use client";

import { useState, useMemo, useCallback } from "react";
import { useCustomHabits, type RepeatSchedule } from "@/hooks/useCustomHabits";
import { useCategoryEditorModals } from "@/hooks/useCategoryEditorModals";
import {
  trackCategoryAction,
  trackHabitAction,
} from "@/utils/analytics";

/**
 * Encapsulates edit-mode state for the home page.
 * Reuses the shared `useCategoryEditorModals` hook so the editing
 * experience (modals, confirmations) is identical to the manage page.
 */
export function useHomeEditMode(customHabits: ReturnType<typeof useCustomHabits>) {
  const {
    categories,
    addCategory,
    updateCategory,
    removeCategory,
    reorderCategories,
    reorderHabits,
    addHabit,
    updateHabit,
    removeHabit,
  } = customHabits;

  const [isEditing, setIsEditing] = useState(false);

  const toggleEditing = useCallback(() => setIsEditing((prev) => !prev), []);

  // Wrap mutations with analytics (mirrors useManagePage)
  const mutations = useMemo(
    () => ({
      addCategory: (name: string, icon: string) => {
        addCategory(name, icon);
        trackCategoryAction("add");
      },
      updateCategory: (id: string, name: string, icon: string) => {
        updateCategory(id, name, icon);
        trackCategoryAction("edit", id);
      },
      removeCategory: (id: string) => {
        removeCategory(id);
        trackCategoryAction("remove", id);
      },
      addHabit: (
        catId: string,
        label: string,
        type: "boolean" | "number",
        schedule?: RepeatSchedule,
        goal?: number
      ) => {
        addHabit(catId, label, type, schedule, goal);
        trackHabitAction("add");
      },
      updateHabit: (
        catId: string,
        habitId: string,
        label: string,
        type: "boolean" | "number",
        schedule?: RepeatSchedule,
        goal?: number
      ) => {
        updateHabit(catId, habitId, label, type, schedule, goal);
        trackHabitAction("edit", habitId);
      },
      removeHabit: (catId: string, habitId: string) => {
        removeHabit(catId, habitId);
        trackHabitAction("remove", habitId);
      },
    }),
    [addCategory, updateCategory, removeCategory, addHabit, updateHabit, removeHabit]
  );

  const editor = useCategoryEditorModals(mutations);

  return {
    isEditing,
    toggleEditing,
    categories,
    reorderCategories,
    reorderHabits,
    ...editor,
  };
}
