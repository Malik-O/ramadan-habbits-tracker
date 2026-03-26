"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderPlus, ListChecks, BookTemplate } from "lucide-react";
import { useManagePage } from "@/hooks/useManagePage";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import ConfirmDialog from "@/components/ConfirmDialog";
import FolderCard from "@/components/manage/FolderCard";
import CategoryFormModal from "@/components/manage/CategoryFormModal";
import HabitFormModal from "@/components/manage/HabitFormModal";
import ManageHeader from "@/components/manage/ManageHeader";
import TemplateHubSection from "@/components/manage/TemplateHubSection";
import TabSwitcher from "@/components/TabSwitcher";
import type { HabitCategory, HabitItem } from "@/constants/habits";

export default function ManagePage() {
  const {
    categories,
    categoryModalOpen,
    editingCategory,
    habitModalOpen,
    editingHabit,
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
    closeCategoryModal,
    closeHabitModal,
    handleReset,
  } = useManagePage();

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"habits" | "templates">("habits");

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg pb-20">
      {/* Header */}
      <ManageHeader
        showReset={activeTab === "habits"}
        onReset={() => setResetConfirmOpen(true)}
      />

      {/* Tab Switcher */}
      <div className="px-4 pt-4">
        <TabSwitcher<"habits" | "templates">
          layoutId="manageTab"
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "habits", label: "عاداتي", icon: <ListChecks className="h-4 w-4" /> },
            { id: "templates", label: "مركز القوالب", icon: <BookTemplate className="h-4 w-4" /> },
          ]}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 px-4 pb-4">
        {activeTab === "habits" ? (
          <HabitsTabContent
            categories={categories}
            onEditCategory={handleEditCategory}
            onRemoveCategory={handleRemoveCategory}
            onAddHabit={handleAddHabit}
            onEditHabit={handleEditHabit}
            onRemoveHabit={handleRemoveHabit}
            onAddCategory={handleAddCategory}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <TemplateHubSection currentUserUid={user?.uid ?? null} />
          </motion.div>
        )}
      </div>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={categoryModalOpen}
        onClose={closeCategoryModal}
        onSubmit={handleCategorySubmit}
        initialValues={editingCategory}
      />

      {/* Habit Form Modal */}
      <HabitFormModal
        isOpen={habitModalOpen}
        onClose={closeHabitModal}
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

// ─── HabitsTabContent ────────────────────────────────────────────

interface HabitsTabContentProps {
  categories: HabitCategory[];
  onEditCategory: (category: HabitCategory) => void;
  onRemoveCategory: (categoryId: string) => void;
  onAddHabit: (categoryId: string) => void;
  onEditHabit: (categoryId: string, habit: HabitItem) => void;
  onRemoveHabit: (categoryId: string, habitId: string) => void;
  onAddCategory: () => void;
}

function HabitsTabContent({
  categories,
  onEditCategory,
  onRemoveCategory,
  onAddHabit,
  onEditHabit,
  onRemoveHabit,
  onAddCategory,
}: HabitsTabContentProps) {
  return (
    <>
      {/* Folder summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between rounded-xl bg-gradient-to-l from-amber-500/5 to-transparent px-4 py-2.5"
      >
        <span className="text-xs text-theme-secondary">
          {categories.length} أقسام ·{" "}
          {categories.reduce((acc, cat) => acc + cat.items.length, 0)} عبادة
        </span>
      </motion.div>

      {/* Folder cards */}
      <AnimatePresence mode="popLayout">
        {categories.map((category, index) => (
          <FolderCard
            key={category.id}
            category={category}
            defaultOpen={index === 0}
            onEditCategory={() => onEditCategory(category)}
            onRemoveCategory={() => onRemoveCategory(category.id)}
            onAddHabit={() => onAddHabit(category.id)}
            onEditHabit={(habit) => onEditHabit(category.id, habit)}
            onRemoveHabit={(habitId) => onRemoveHabit(category.id, habitId)}
          />
        ))}
      </AnimatePresence>

      {/* Add Folder button */}
      <motion.button
        onClick={onAddCategory}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-theme-border/50 py-4 text-theme-secondary/60 transition-colors hover:border-amber-500/40 hover:text-amber-400"
        whileTap={{ scale: 0.98 }}
      >
        <FolderPlus className="h-5 w-5" />
        <span className="text-sm font-medium">إضافة قسم جديد</span>
      </motion.button>
    </>
  );
}
