"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { useCustomHabits } from "@/hooks/useCustomHabits";
import BottomNav from "@/components/BottomNav";
import ConfirmDialog from "@/components/ConfirmDialog";
import CategoryCard from "@/components/manage/CategoryCard";
import CategoryFormModal from "@/components/manage/CategoryFormModal";
import HabitFormModal from "@/components/manage/HabitFormModal";
import type { HabitCategory, HabitItem } from "@/constants/habits";
import {
  trackCategoryAction,
  trackHabitAction,
  trackDataReset,
} from "@/utils/analytics";

export default function ManagePage() {
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
  const [editingCategory, setEditingCategory] = useState<HabitCategory | null>(null);

  // Habit form state
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [habitTargetCategoryId, setHabitTargetCategoryId] = useState<string>("");
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

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-header backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
            >
              <ArrowRight className="h-4 w-4 text-theme-secondary" />
            </Link>
            <h1 className="text-lg font-bold text-theme-primary">إدارة العادات</h1>
          </div>
          <button
            onClick={() => setIsEditMode((p) => !p)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              isEditMode
                ? "bg-amber-500 text-slate-950"
                : "bg-theme-subtle text-theme-secondary hover:bg-theme-border"
            }`}
          >
            {isEditMode ? "تم" : "تعديل"}
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3 p-4">
        {/* Categories */}
        <AnimatePresence mode="popLayout">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isEditMode={isEditMode}
              onEditCategory={() => handleEditCategory(category)}
              onRemoveCategory={() => handleRemoveCategory(category.id)}
              onAddHabit={() => handleAddHabit(category.id)}
              onEditHabit={(habit) => handleEditHabit(category.id, habit)}
              onRemoveHabit={(habitId) => handleRemoveHabit(category.id, habitId)}
            />
          ))}
        </AnimatePresence>

        {/* Add Category button */}
        <motion.button
          onClick={handleAddCategory}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-theme-border py-4 text-theme-secondary transition-colors hover:border-amber-500/50 hover:text-amber-500"
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm font-medium">إضافة قسم جديد</span>
        </motion.button>

        {/* Reset defaults */}
        {isEditMode && (
          <motion.button
            onClick={() => setResetConfirmOpen(true)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 rounded-2xl border border-red-500/20 bg-red-500/5 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            إعادة تعيين إلى الافتراضي
          </motion.button>
        )}
      </div>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleCategorySubmit}
        initialValues={editingCategory}
      />

      {/* Habit Form Modal */}
      <HabitFormModal
        isOpen={habitModalOpen}
        onClose={() => {
          setHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSubmit={handleHabitSubmit}
        initialValues={editingHabit}
      />

      <BottomNav activeTab="manage" />

      {/* Reset Confirm Dialog */}
      <ConfirmDialog
        isOpen={resetConfirmOpen}
        title="إعادة تعيين"
        message="سيتم إعادة جميع الأقسام والعادات إلى الإعدادات الافتراضية. هل أنت متأكد؟"
        confirmLabel="إعادة تعيين"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
}
