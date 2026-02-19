"use client";

import { useState } from "react";
import { useCustomHabits } from "@/hooks/useCustomHabits";
import type { HabitCategory, HabitItem } from "@/constants/habits";
import {
  trackCategoryAction,
  trackHabitAction,
  trackDataReset,
} from "@/utils/analytics";

export function useManagePage() {
  const {
    categories,
    addCategory,
    updateCategory,
    removeCategory,
    addHabit,
    updateHabit,
    removeHabit,
    resetToDefaults,
  } = useCustomHabits();

  const [isEditMode, setIsEditMode] = useState(false);

  // Category form state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<HabitCategory | null>(
    null
  );

  // Habit form state
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [habitTargetCategoryId, setHabitTargetCategoryId] =
    useState<string>("");
  const [editingHabit, setEditingHabit] = useState<HabitItem | null>(null);

  // Reset confirm state
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: HabitCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = (name: string, icon: string) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, name, icon);
      trackCategoryAction("edit", editingCategory.id);
    } else {
      addCategory(name, icon);
      trackCategoryAction("add");
    }
    setCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleRemoveCategory = (categoryId: string) => {
    removeCategory(categoryId);
    trackCategoryAction("remove", categoryId);
  };

  const handleAddHabit = (categoryId: string) => {
    setHabitTargetCategoryId(categoryId);
    setEditingHabit(null);
    setHabitModalOpen(true);
  };

  const handleEditHabit = (categoryId: string, habit: HabitItem) => {
    setHabitTargetCategoryId(categoryId);
    setEditingHabit(habit);
    setHabitModalOpen(true);
  };

  const handleHabitSubmit = (label: string, type: "boolean" | "number") => {
    if (editingHabit) {
      updateHabit(habitTargetCategoryId, editingHabit.id, label, type);
      trackHabitAction("edit", editingHabit.id);
    } else {
      addHabit(habitTargetCategoryId, label, type);
      trackHabitAction("add");
    }
    setHabitModalOpen(false);
    setEditingHabit(null);
  };

  const handleRemoveHabit = (categoryId: string, habitId: string) => {
    removeHabit(categoryId, habitId);
    trackHabitAction("remove", habitId);
  };

  const handleReset = () => {
    resetToDefaults();
    trackDataReset();
    setIsEditMode(false);
    setResetConfirmOpen(false);
  };

  return {
    categories,
    isEditMode,
    setIsEditMode,
    categoryModalOpen,
    setCategoryModalOpen,
    editingCategory,
    setEditingCategory,
    habitModalOpen,
    setHabitModalOpen,
    editingHabit,
    setEditingHabit,
    resetConfirmOpen,
    setResetConfirmOpen,
    handleAddCategory,
    handleEditCategory,
    handleCategorySubmit,
    handleRemoveCategory,
    handleAddHabit,
    handleEditHabit,
    handleHabitSubmit,
    handleRemoveHabit,
    handleReset,
  };
}
