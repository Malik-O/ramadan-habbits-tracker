import { motion, AnimatePresence } from "framer-motion";
import { FolderPlus } from "lucide-react";
import FolderCard from "@/components/manage/FolderCard";
import type { HabitCategory, HabitItem } from "@/constants/habits";

interface HabitsTabContentProps {
  categories: HabitCategory[];
  onEditCategory: (category: HabitCategory) => void;
  onRemoveCategory: (categoryId: string) => void;
  onAddHabit: (categoryId: string) => void;
  onEditHabit: (categoryId: string, habit: HabitItem) => void;
  onRemoveHabit: (categoryId: string, habitId: string) => void;
  onAddCategory: () => void;
}

export default function HabitsTabContent({
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
