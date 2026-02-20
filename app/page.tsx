"use client";

import { useMemo } from "react";
import { INSPIRATIONAL_QUOTES } from "@/constants/habits";
import { getActiveBlockId } from "@/utils/timeBlocks";
import { useHabitTracker } from "@/hooks/useHabitTracker";
import { useCustomHabits } from "@/hooks/useCustomHabits";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useSync } from "@/hooks/useSync";
import { useMergedHabits } from "@/hooks/useMergedHabits";
import Header from "@/components/Header";
import DaySelector from "@/components/DaySelector";
import HabitBlock from "@/components/HabitBlock";
import ConfettiTrigger from "@/components/ConfettiTrigger";
import BottomNav from "@/components/BottomNav";
import QuoteBanner from "@/components/QuoteBanner";
import DayLabel from "@/components/DayLabel";

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

  const randomQuote = useMemo(
    () =>
      INSPIRATIONAL_QUOTES[
        Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)
      ],
    []
  );

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

      {/* Inspirational quote */}
      <QuoteBanner quote={randomQuote} />

      {/* Day selector */}
      <DaySelector
        currentDay={currentDay}
        onSelectDay={setCurrentDay}
        trackerState={trackerState}
      />

      {/* Day label */}
      <DayLabel day={currentDay} />

      {/* Habit blocks — merged personal + group habits */}
      <div className="flex flex-col gap-3 pb-8">
        {mergedCategories.map((category) => (
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
      </div>

      {/* Confetti trigger */}
      <ConfettiTrigger blockCompletion={blockCompletion} currentDay={currentDay} />

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
}
