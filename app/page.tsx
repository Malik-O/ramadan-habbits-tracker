"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, X } from "lucide-react";
import { INSPIRATIONAL_QUOTES } from "@/constants/habits";
import type { HabitCategory } from "@/constants/habits";
import { getActiveBlockId } from "@/utils/timeBlocks";
import { filterHabitsForDate } from "@/utils/habitSchedule";
import { getGregorianDateForDay } from "@/utils/hijri";
import { useHabitTracker } from "@/hooks/useHabitTracker";
import { useCustomHabits } from "@/hooks/useCustomHabits";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useSync } from "@/hooks/useSync";
import { useMergedHabits } from "@/hooks/useMergedHabits";
import { useHomeEditMode } from "@/hooks/useHomeEditMode";
import Header from "@/components/Header";
import DaySelector from "@/components/DaySelector";
import HabitBlock from "@/components/HabitBlock";
import ConfettiTrigger from "@/components/ConfettiTrigger";
import BottomNav from "@/components/BottomNav";
import FolderCard from "@/components/manage/FolderCard";
import CategoryFormModal from "@/components/manage/CategoryFormModal";
import HabitFormModal from "@/components/manage/HabitFormModal";

export default function HomePage() {
  const { categories, setCategories, customHabitsUpdatedAt, setCustomHabitsUpdatedAt } = useCustomHabits();
  const { user } = useAuth();
  const { theme } = useTheme();

  // Merge personal habits with group habits (adds group-exclusive items & tags)
  const { mergedCategories, getGroupNames } = useMergedHabits(categories, !!user);

  const {
    currentDay,
    setCurrentDay,
    trackerState,
    setTrackerState,
    dayUpdatedAt,
    setDayUpdatedAt,
    toggleHabit,
    setHabitValue,
    getHabitValue,
    totalXp,
    todayXp,
    todayProgress,
    streak,
    blockCompletion,
    totalHabits,
    completedHabits,
  } = useHabitTracker(mergedCategories);

  // Filter habits based on repeat schedule for the selected date
  const filteredCategories = useMemo((): HabitCategory[] => {
    const dateForDay = getGregorianDateForDay(currentDay);
    return mergedCategories
      .map((cat) => ({
        ...cat,
        items: filterHabitsForDate(cat.items, dateForDay),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [mergedCategories, currentDay]);

  // Background sync: uploads on change when logged in, downloads on login
  useSync({
    isAuthenticated: !!user,
    trackerState,
    dayUpdatedAt,
    customHabits: categories,
    customHabitsUpdatedAt,
    currentDay,
    theme,
    setTrackerState,
    setDayUpdatedAt,
    setCustomHabits: setCategories,
    setCustomHabitsUpdatedAt,
    setCurrentDay,
  });

  const activeBlockId = useMemo(() => {
    const hour = new Date().getHours();
    return getActiveBlockId(hour);
  }, []);

  // ── Edit-mode state ──────────────────────────────────────────
  const {
    isEditing,
    toggleEditing,
    categoryModalOpen,
    editingCategory,
    habitModalOpen,
    editingHabit,
    handleEditCategory,
    handleRemoveCategory,
    handleAddHabit,
    handleEditHabit,
    handleHabitSubmit,
    handleRemoveHabit,
    handleCategorySubmit,
    closeCategoryModal,
    closeHabitModal,
  } = useHomeEditMode();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg pb-20">
      {/* Sticky header */}
      <Header
        todayXp={todayXp}
        totalXp={totalXp}
        progress={todayProgress}
        streak={streak}
        completedHabits={completedHabits}
        totalHabits={totalHabits}
      />

      {/* Day selector */}
      <DaySelector
        currentDay={currentDay}
        onSelectDay={setCurrentDay}
        trackerState={trackerState}
      />

      {/* Habit blocks — merged personal + group habits, filtered by schedule */}
      <div className="flex flex-col gap-3 pb-8 mt-4">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <EditModeList
              categories={mergedCategories}
              onEditCategory={handleEditCategory}
              onRemoveCategory={handleRemoveCategory}
              onAddHabit={handleAddHabit}
              onEditHabit={handleEditHabit}
              onRemoveHabit={handleRemoveHabit}
            />
          ) : (
            <TrackingModeList
              categories={filteredCategories}
              activeBlockId={activeBlockId}
              blockCompletion={blockCompletion}
              getHabitValue={getHabitValue}
              toggleHabit={toggleHabit}
              setHabitValue={setHabitValue}
              getGroupNames={getGroupNames}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Edit FAB ─────────────────────────────────────────── */}
      <EditFab isEditing={isEditing} onToggle={toggleEditing} />

      {/* Modals (only rendered during edit mode) */}
      <CategoryFormModal
        isOpen={categoryModalOpen}
        onClose={closeCategoryModal}
        onSubmit={handleCategorySubmit}
        initialValues={editingCategory}
      />
      <HabitFormModal
        isOpen={habitModalOpen}
        onClose={closeHabitModal}
        onSubmit={handleHabitSubmit}
        initialValues={editingHabit}
      />

      {/* Confetti trigger */}
      <ConfettiTrigger blockCompletion={blockCompletion} currentDay={currentDay} />

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
}

// ─── TrackingModeList ─────────────────────────────────────────────

interface TrackingModeListProps {
  categories: HabitCategory[];
  activeBlockId: string;
  blockCompletion: Record<string, boolean>;
  getHabitValue: (id: string) => import("@/hooks/useHabitTracker").HabitValue;
  toggleHabit: (id: string) => void;
  setHabitValue: (id: string, value: number) => void;
  getGroupNames?: (categoryName: string, habitLabel: string) => string[];
}

function TrackingModeList({
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

// ─── EditModeList ─────────────────────────────────────────────────

interface EditModeListProps {
  categories: HabitCategory[];
  onEditCategory: (category: HabitCategory) => void;
  onRemoveCategory: (categoryId: string) => void;
  onAddHabit: (categoryId: string) => void;
  onEditHabit: (categoryId: string, habit: import("@/constants/habits").HabitItem) => void;
  onRemoveHabit: (categoryId: string, habitId: string) => void;
}

function EditModeList({
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

// ─── EditFab ──────────────────────────────────────────────────────

interface EditFabProps {
  isEditing: boolean;
  onToggle: () => void;
}

function EditFab({ isEditing, onToggle }: EditFabProps) {
  return (
    <motion.button
      onClick={onToggle}
      className={`fixed bottom-24 left-4 z-40 flex h-12 items-center gap-2 rounded-full px-4 shadow-lg backdrop-blur-md transition-colors cursor-pointer ${
        isEditing
          ? "bg-red-500/90 text-white shadow-red-500/25 hover:bg-red-500"
          : "bg-theme-card/90 border border-theme-border text-theme-primary shadow-black/10 hover:border-amber-500/40 hover:text-amber-400"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      layout
    >
      <AnimatePresence mode="wait" initial={false}>
        {isEditing ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            <span className="text-xs font-semibold">إنهاء التعديل</span>
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            <span className="text-xs font-semibold">تعديل</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
