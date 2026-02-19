"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useManagePage } from "@/hooks/useManagePage";
import BottomNav from "@/components/BottomNav";
import ConfirmDialog from "@/components/ConfirmDialog";
import CategoryCard from "@/components/manage/CategoryCard";
import CategoryFormModal from "@/components/manage/CategoryFormModal";
import HabitFormModal from "@/components/manage/HabitFormModal";
import ManageHeader from "@/components/manage/ManageHeader";

export default function ManagePage() {
  const {
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
  } = useManagePage();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg pb-20">
      {/* Header */}
      <ManageHeader
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode((p) => !p)}
      />

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
