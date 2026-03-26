"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import CategoryFormModal from "@/components/manage/CategoryFormModal";
import HabitFormModal from "@/components/manage/HabitFormModal";
import TrackingModeList from "@/components/home/TrackingModeList";
import EditModeList from "@/components/home/EditModeList";
import EditToggle from "@/components/home/EditToggle";

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

      {/* Inline edit toggle */}
      <EditToggle isEditing={isEditing} onToggle={toggleEditing} />

      {/* Habit blocks — merged personal + group habits, filtered by schedule */}
      <div className="flex flex-col gap-3 pb-8">
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

