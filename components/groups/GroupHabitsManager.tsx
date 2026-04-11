"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Download } from "lucide-react";
import type { GroupResponse, GroupCategory } from "@/services/api";
import CategoryCard from "@/components/manage/CategoryCard";
import CategoryFormModal from "@/components/manage/CategoryFormModal";
import HabitFormModal from "@/components/manage/HabitFormModal";
import GroupTemplateImportModal from "@/components/groups/GroupTemplateImportModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { HabitCategory, HabitItem } from "@/constants/habits";
import type { TemplateResponse } from "@/services/api";

// ─── Types ───────────────────────────────────────────────────────

interface GroupHabitsManagerProps {
  group: GroupResponse;
  onSave: (groupId: string, categories: GroupCategory[]) => Promise<GroupResponse | null>;
  onClose: () => void;
}

/** Generate a short unique ID */
function generateId(): string {
  return `grp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Convert GroupCategory to HabitCategory for reusing manage components */
function toHabitCategory(gc: GroupCategory): HabitCategory {
  return {
    id: gc.categoryId,
    name: gc.name,
    icon: gc.icon,
    items: gc.items.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      goal: (item as any).goal,
    })),
  };
}

/** Convert HabitCategory back to GroupCategory */
function toGroupCategory(hc: HabitCategory, index: number): GroupCategory {
  return {
    categoryId: hc.id,
    name: hc.name,
    icon: hc.icon,
    items: hc.items.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      goal: item.goal,
    })),
    sortOrder: index,
  };
}

// ─── Component ───────────────────────────────────────────────────

export default function GroupHabitsManager({
  group,
  onSave,
  onClose,
}: GroupHabitsManagerProps) {
  const [categories, setCategories] = useState<HabitCategory[]>(
    group.categories.map(toHabitCategory)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<HabitCategory | null>(null);
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<{
    categoryId: string;
    habit?: HabitItem;
  } | null>(null);
  const [showTemplateImport, setShowTemplateImport] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const initialCategoriesJson = useMemo(
    () => JSON.stringify(group.categories.map(toHabitCategory)),
    [group.categories]
  );

  const handleCloseAttempt = useCallback(() => {
    const hasChanges = initialCategoriesJson !== JSON.stringify(categories);
    if (hasChanges) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  }, [initialCategoriesJson, categories, onClose]);

  // ─── Category handlers ─────────────────────────────────────────

  const handleAddCategory = useCallback(() => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  }, []);

  const handleEditCategory = useCallback((cat: HabitCategory) => {
    setEditingCategory(cat);
    setCategoryModalOpen(true);
  }, []);

  const handleCategorySubmit = useCallback(
    (name: string, icon: string) => {
      if (editingCategory) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingCategory.id ? { ...cat, name, icon } : cat
          )
        );
      } else {
        setCategories((prev) => [
          ...prev,
          { id: generateId(), name, icon, items: [] },
        ]);
      }
      setCategoryModalOpen(false);
      setEditingCategory(null);
    },
    [editingCategory]
  );

  const handleRemoveCategory = useCallback((catId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
  }, []);

  // ─── Habit handlers ────────────────────────────────────────────

  const handleAddHabit = useCallback((categoryId: string) => {
    setEditingHabit({ categoryId });
    setHabitModalOpen(true);
  }, []);

  const handleEditHabit = useCallback((categoryId: string, habit: HabitItem) => {
    setEditingHabit({
      categoryId,
      habit,
    });
    setHabitModalOpen(true);
  }, []);

  const handleHabitSubmit = useCallback(
    (label: string, type: "boolean" | "number", schedule: any, goal?: number) => {
      if (!editingHabit) return;

      if (editingHabit.habit) {
        // Editing existing
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingHabit.categoryId
              ? {
                  ...cat,
                  items: cat.items.map((item) =>
                    item.id === editingHabit.habit!.id
                      ? { ...item, label, type, goal, ...schedule }
                      : item
                  ),
                }
              : cat
          )
        );
      } else {
        // Adding new
        const newHabit: HabitItem = { id: generateId(), label, type, goal, ...schedule };
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingHabit.categoryId
              ? { ...cat, items: [...cat.items, newHabit] }
              : cat
          )
        );
      }

      setHabitModalOpen(false);
      setEditingHabit(null);
    },
    [editingHabit]
  );

  const handleRemoveHabit = useCallback((categoryId: string, habitId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter((i) => i.id !== habitId) }
          : cat
      )
    );
  }, []);

  // ─── Template import handler ────────────────────────────────────

  const handleImportTemplate = useCallback((template: TemplateResponse) => {
    const importedCategories: HabitCategory[] = template.categories.map((cat) => ({
      id: `grp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: cat.name,
      icon: cat.icon,
      items: cat.items.map((item) => ({
        id: `grp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        label: item.label,
        type: item.type,
        goal: (item as any).goal,
      })),
    }));

    setCategories((prev) => {
      // Smart merge: for each imported category, check if a category with the same name exists
      const merged = [...prev];
      for (const imported of importedCategories) {
        const existingIndex = merged.findIndex(
          (c) => c.name.trim() === imported.name.trim()
        );
        if (existingIndex >= 0) {
          // Merge items, skip duplicates by label
          const existing = merged[existingIndex];
          const existingLabels = new Set(existing.items.map((i) => i.label.trim()));
          const newItems = imported.items.filter(
            (item) => !existingLabels.has(item.label.trim())
          );
          merged[existingIndex] = {
            ...existing,
            items: [...existing.items, ...newItems],
          };
        } else {
          merged.push(imported);
        }
      }
      return merged;
    });
  }, []);

  // ─── Save ──────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const groupCategories = categories.map(toGroupCategory);
    await onSave(group._id, groupCategories);
    setIsSaving(false);
    onClose();
  }, [categories, group._id, onSave, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCloseAttempt}
      />

      {/* Modal */}
      <motion.div
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col rounded-t-3xl bg-theme-bg shadow-2xl sm:rounded-3xl"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-theme-border px-5 py-4">
          <button
            onClick={handleCloseAttempt}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-subtle text-theme-secondary transition-colors hover:bg-theme-border"
          >
            <X className="h-4 w-4" />
          </button>

          <h3 className="text-sm font-bold text-theme-primary">
            إدارة عبادات المجموعة
          </h3>

          <motion.button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
            whileTap={{ scale: 0.95 }}
          >
            {isSaving ? "جاري..." : "حفظ"}
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isEditMode={true}
                  onEditCategory={() => handleEditCategory(category)}
                  onRemoveCategory={() => handleRemoveCategory(category.id)}
                  onAddHabit={() => handleAddHabit(category.id)}
                  onEditHabit={(habit) => handleEditHabit(category.id, habit)}
                  onRemoveHabit={(habitId) => handleRemoveHabit(category.id, habitId)}
                />
              ))}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex gap-2">
              <motion.button
                onClick={() => setShowTemplateImport(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-theme-border py-4 text-theme-secondary transition-colors hover:border-amber-500/50 hover:text-amber-500"
                whileTap={{ scale: 0.98 }}
              >
                <Download className="h-5 w-5" />
                <span className="text-sm font-medium">استيراد قالب</span>
              </motion.button>
              <motion.button
                onClick={handleAddCategory}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-theme-border py-4 text-theme-secondary transition-colors hover:border-amber-500/50 hover:text-amber-500"
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm font-medium">إضافة قسم</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

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
        initialValues={editingHabit?.habit || null}
      />

      {/* Template Import Modal */}
      <GroupTemplateImportModal
        isOpen={showTemplateImport}
        onClose={() => setShowTemplateImport(false)}
        onImport={handleImportTemplate}
      />

      {/* Unsaved Changes Dialog */}
      <ConfirmDialog
        isOpen={showCloseConfirm}
        title="تجاهل التعديلات؟"
        message="هناك تعديلات لم يتم حفظها. هل أنت متأكد من رغبتك في تجاهلها وإغلاق النافذة؟"
        confirmLabel="تجاهل وإغلاق"
        cancelLabel="إلغاء"
        variant="warning"
        onConfirm={onClose}
        onCancel={() => setShowCloseConfirm(false)}
      />
    </motion.div>
  );
}
