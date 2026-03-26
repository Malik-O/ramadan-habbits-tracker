import { motion, AnimatePresence } from "framer-motion";
import FolderCard from "@/components/manage/FolderCard";
import type { HabitCategory } from "@/constants/habits";

interface EditModeListProps {
  categories: HabitCategory[];
  onEditCategory: (category: HabitCategory) => void;
  onRemoveCategory: (categoryId: string) => void;
  onAddHabit: (categoryId: string) => void;
  onEditHabit: (categoryId: string, habit: import("@/constants/habits").HabitItem) => void;
  onRemoveHabit: (categoryId: string, habitId: string) => void;
}

export default function EditModeList({
  categories,
  onEditCategory,
  onRemoveCategory,
  onAddHabit,
  onEditHabit,
  onRemoveHabit,
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
    </motion.div>
  );
}
