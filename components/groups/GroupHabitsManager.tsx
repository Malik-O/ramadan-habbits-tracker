"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import type { GroupResponse, GroupCategory } from "@/services/api";
import CategoryCard from "@/components/manage/CategoryCard";
import CategoryFormModal from "@/components/manage/CategoryFormModal";
import HabitFormModal from "@/components/manage/HabitFormModal";
import type { HabitCategory, HabitItem } from "@/constants/habits";

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
    habit?: { id: string; label: string; type: "boolean" | "number" };
  } | null>(null);

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
      habit: { id: habit.id, label: habit.label, type: habit.type },
    });
    setHabitModalOpen(true);
  }, []);

  const handleHabitSubmit = useCallback(
    (label: string, type: "boolean" | "number") => {
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
                      ? { ...item, label, type }
                      : item
                  ),
                }
              : cat
          )
        );
      } else {
        // Adding new
        const newHabit: HabitItem = { id: generateId(), label, type };
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
        onClick={onClose}
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
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-subtle text-theme-secondary transition-colors hover:bg-theme-border"
          >
            <X className="h-4 w-4" />
          </button>

          <h3 className="text-sm font-bold text-theme-primary">
            إدارة عادات المجموعة
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

            {/* Add category button */}
            <motion.button
              onClick={handleAddCategory}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-theme-border py-4 text-theme-secondary transition-colors hover:border-amber-500/50 hover:text-amber-500"
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">إضافة قسم جديد</span>
            </motion.button>
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
    </motion.div>
  );
}
