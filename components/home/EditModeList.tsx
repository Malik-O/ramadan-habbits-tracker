import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Plus } from "lucide-react";
import FolderCard from "@/components/manage/FolderCard";
import type { HabitCategory } from "@/constants/habits";

interface EditModeListProps {
  categories: HabitCategory[];
  onAddCategory: () => void;
  onEditCategory: (category: HabitCategory) => void;
  onRemoveCategory: (categoryId: string) => void;
  onAddHabit: (categoryId: string) => void;
  onEditHabit: (categoryId: string, habit: import("@/constants/habits").HabitItem) => void;
  onRemoveHabit: (categoryId: string, habitId: string) => void;
  onReorderCategories: (newOrder: HabitCategory[]) => void;
  onReorderHabits: (categoryId: string, newItems: import("@/constants/habits").HabitItem[]) => void;
}

export default function EditModeList({
  categories,
  onAddCategory,
  onEditCategory,
  onRemoveCategory,
  onAddHabit,
  onEditHabit,
  onRemoveHabit,
  onReorderCategories,
  onReorderHabits,
}: EditModeListProps) {
  return (
    <motion.div
      key="editing"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-3 px-4"
    >
      {/* Edit-mode banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between rounded-xl bg-gradient-to-l from-amber-500/10 to-transparent px-4 py-2.5"
      >
        <span className="text-xs font-medium text-amber-400">
          وضع التعديل
        </span>
        <span className="text-xs text-theme-secondary">
          {categories.length} أقسام ·{" "}
          {categories.reduce((acc, cat) => acc + cat.items.length, 0)} عبادة
        </span>
      </motion.div>

      <AnimatePresence mode="popLayout">
        <Reorder.Group
          axis="y"
          values={categories}
          onReorder={onReorderCategories}
          className="flex flex-col gap-3"
        >
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
              onReorderHabits={(newItems) => onReorderHabits(category.id, newItems)}
            />
          ))}
        </Reorder.Group>
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onAddCategory}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-theme-border py-4 text-theme-secondary transition-colors hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-amber-500"
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">إضافة قسم جديد</span>
      </motion.button>
    </motion.div>
  );
}
