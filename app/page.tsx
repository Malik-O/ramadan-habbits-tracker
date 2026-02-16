"use client";

import { useMemo } from "react";
import { HABIT_CATEGORIES, INSPIRATIONAL_QUOTES } from "@/constants/habits";
import { getActiveBlockId } from "@/utils/timeBlocks";
import { useHabitTracker } from "@/hooks/useHabitTracker";
import Header from "@/components/Header";
import DaySelector from "@/components/DaySelector";
import HabitBlock from "@/components/HabitBlock";
import ConfettiTrigger from "@/components/ConfettiTrigger";

export default function HomePage() {
  const {
    currentDay,
    setCurrentDay,
    trackerState,
    toggleHabit,
    incrementHabit,
    decrementHabit,
    getHabitValue,
    totalXp,
    todayXp,
    todayProgress,
    streak,
    blockCompletion,
    totalHabits,
    completedHabits,
  } = useHabitTracker();

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
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-slate-950">
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

      {/* Habit blocks */}
      <div className="flex flex-col gap-3 pb-8">
        {HABIT_CATEGORIES.map((category) => (
          <HabitBlock
            key={category.id}
            category={category}
            isDefaultOpen={category.id === activeBlockId}
            isCompleted={blockCompletion[category.id] ?? false}
            getHabitValue={getHabitValue}
            toggleHabit={toggleHabit}
            incrementHabit={incrementHabit}
            decrementHabit={decrementHabit}
          />
        ))}
      </div>

      {/* Confetti trigger */}
      <ConfettiTrigger blockCompletion={blockCompletion} />
    </div>
  );
}

/** Small inspirational quote banner */
function QuoteBanner({ quote }: { quote: string }) {
  return (
    <div className="border-b border-white/5 px-4 py-2.5 text-center">
      <p className="text-xs leading-relaxed text-amber-400/70 italic">
        ❝ {quote} ❞
      </p>
    </div>
  );
}

/** Day label showing "Day X" */
function DayLabel({ day }: { day: number }) {
  return (
    <div className="px-4 pt-2 pb-1">
      <h2 className="text-base font-bold text-white">
        اليوم {day + 1}
        <span className="mr-2 text-sm font-normal text-slate-500">
           من رمضان
        </span>
      </h2>
    </div>
  );
}
