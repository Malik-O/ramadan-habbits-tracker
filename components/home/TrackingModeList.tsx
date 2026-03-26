import { motion } from "framer-motion";
import HabitBlock from "@/components/HabitBlock";
import type { HabitCategory } from "@/constants/habits";

interface TrackingModeListProps {
  categories: HabitCategory[];
  activeBlockId: string;
  blockCompletion: Record<string, boolean>;
  getHabitValue: (id: string) => import("@/hooks/useHabitTracker").HabitValue;
  toggleHabit: (id: string) => void;
  setHabitValue: (id: string, value: number) => void;
  getGroupNames?: (categoryName: string, habitLabel: string) => string[];
}

export default function TrackingModeList({
  categories,
  activeBlockId,
  blockCompletion,
  getHabitValue,
  toggleHabit,
  setHabitValue,
  getGroupNames,
}: TrackingModeListProps) {
  return (
    <motion.div
      key="tracking"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-3"
    >
      {categories.map((category) => (
        <HabitBlock
          key={category.id}
          category={category}
          isDefaultOpen={category.id === activeBlockId}
          isCompleted={blockCompletion[category.id] ?? false}
          getHabitValue={getHabitValue}
          toggleHabit={toggleHabit}
          setHabitValue={setHabitValue}
          getGroupNames={getGroupNames}
        />
      ))}
    </motion.div>
  );
}
