"use client";

import { useState, useRef, useCallback } from "react";
import type { HabitCategory, HabitItem } from "@/constants/habits";
import type { RepeatSchedule } from "@/hooks/useCustomHabits";

// ─── Types ───────────────────────────────────────────────────────

/** Mutation functions for category/habit CRUD */
export interface CategoryMutations {
  addCategory: (name: string, icon: string) => void;
  updateCategory: (categoryId: string, name: string, icon: string) => void;
  removeCategory: (categoryId: string) => void;
  addHabit: (categoryId: string, label: string, type: "boolean" | "number", schedule?: RepeatSchedule, goal?: number) => void;
  updateHabit: (categoryId: string, habitId: string, label: string, type: "boolean" | "number", schedule?: RepeatSchedule, goal?: number) => void;
  removeHabit: (categoryId: string, habitId: string) => void;
}

export interface CategoryEditorModals {
  categoryModalOpen: boolean;
  editingCategory: HabitCategory | null;
  habitModalOpen: boolean;
  editingHabit: HabitItem | null;
  handleAddCategory: () => void;
  handleEditCategory: (category: HabitCategory) => void;
  handleCategorySubmit: (name: string, icon: string) => void;
  handleRemoveCategory: (categoryId: string) => void;
  handleAddHabit: (categoryId: string) => void;
  handleEditHabit: (categoryId: string, habit: HabitItem) => void;
  handleHabitSubmit: (label: string, type: "boolean" | "number", schedule: RepeatSchedule, goal?: number) => void;
  handleRemoveHabit: (categoryId: string, habitId: string) => void;
  closeCategoryModal: () => void;
  closeHabitModal: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────

/**
 * Shared hook for category/habit modal orchestration.
 * Takes mutation functions as input so the same modal flow
 * can be reused across different pages (manage page, publish page, etc.).
 */
export function useCategoryEditorModals(
  mutations: CategoryMutations
): CategoryEditorModals {
  // Use a ref so handler closures always see the latest mutations
  const mutRef = useRef(mutations);
  mutRef.current = mutations;

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<HabitCategory | null>(null);

  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [habitTargetCategoryId, setHabitTargetCategoryId] = useState("");
  const [editingHabit, setEditingHabit] = useState<HabitItem | null>(null);

  // ── Category modal handlers ────────────────────────────────

  const handleAddCategory = useCallback(() => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  }, []);

  const handleEditCategory = useCallback((category: HabitCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  }, []);

  const handleCategorySubmit = useCallback((name: string, icon: string) => {
    if (editingCategory) {
      mutRef.current.updateCategory(editingCategory.id, name, icon);
    } else {
      mutRef.current.addCategory(name, icon);
    }
    setCategoryModalOpen(false);
    setEditingCategory(null);
  }, [editingCategory]);

  const handleRemoveCategory = useCallback((categoryId: string) => {
    mutRef.current.removeCategory(categoryId);
  }, []);

  const closeCategoryModal = useCallback(() => {
    setCategoryModalOpen(false);
    setEditingCategory(null);
  }, []);

  // ── Habit modal handlers ───────────────────────────────────

  const handleAddHabit = useCallback((categoryId: string) => {
    setHabitTargetCategoryId(categoryId);
    setEditingHabit(null);
    setHabitModalOpen(true);
  }, []);

  const handleEditHabit = useCallback((categoryId: string, habit: HabitItem) => {
    setHabitTargetCategoryId(categoryId);
    setEditingHabit(habit);
    setHabitModalOpen(true);
  }, []);

  const handleHabitSubmit = useCallback(
    (label: string, type: "boolean" | "number", schedule: RepeatSchedule, goal?: number) => {
      if (editingHabit) {
        mutRef.current.updateHabit(habitTargetCategoryId, editingHabit.id, label, type, schedule, goal);
      } else {
        mutRef.current.addHabit(habitTargetCategoryId, label, type, schedule, goal);
      }
      setHabitModalOpen(false);
      setEditingHabit(null);
    },
    [editingHabit, habitTargetCategoryId]
  );

  const handleRemoveHabit = useCallback((categoryId: string, habitId: string) => {
    mutRef.current.removeHabit(categoryId, habitId);
  }, []);

  const closeHabitModal = useCallback(() => {
    setHabitModalOpen(false);
    setEditingHabit(null);
  }, []);

  return {
    categoryModalOpen,
    editingCategory,
    habitModalOpen,
    editingHabit,
    handleAddCategory,
    handleEditCategory,
    handleCategorySubmit,
    handleRemoveCategory,
    handleAddHabit,
    handleEditHabit,
    handleHabitSubmit,
    handleRemoveHabit,
    closeCategoryModal,
    closeHabitModal,
  };
}
