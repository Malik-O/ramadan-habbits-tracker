"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListChecks, BookTemplate } from "lucide-react";
import { useManagePage } from "@/hooks/useManagePage";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import ConfirmDialog from "@/components/ConfirmDialog";
import ManageHeader from "@/components/manage/ManageHeader";
import TemplateHubSection from "@/components/manage/TemplateHubSection";
import HabitsTabContent from "@/components/manage/HabitsTabContent";
import CategoryFormModal from "@/components/manage/CategoryFormModal";
import HabitFormModal from "@/components/manage/HabitFormModal";
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
            { id: "habits", label: "عباداتي", icon: <ListChecks className="h-4 w-4" /> },
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
        message="سيتم إعادة جميع الأقسام والعبادات إلى الإعدادات الافتراضية. هل أنت متأكد؟"
        confirmLabel="إعادة تعيين"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
}

