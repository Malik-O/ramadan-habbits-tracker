"use client";

import { Sparkles, User } from "lucide-react";
import Link from "next/link";
import ProgressRing from "./ProgressRing";
import StreakBadge from "./StreakBadge";

interface HeaderProps {
  todayXp: number;
  totalXp: number;
  progress: number;
  streak: number;
  completedHabits: number;
  totalHabits: number;
}

export default function Header({
  todayXp,
  progress,
  streak,
  completedHabits,
  totalHabits,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-header backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Progress ring */}
        <ProgressRing progress={progress} />

        {/* XP & habit count */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-lg font-bold text-amber-400">
              {todayXp} XP
            </span>
          </div>
          <span className="text-xs text-theme-secondary">
            {completedHabits}/{totalHabits}
          </span>
        </div>

        {/* Streak + Profile */}
        <div className="flex items-center gap-2">
          <StreakBadge streak={streak} />
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
          >
            <User className="h-4 w-4 text-theme-secondary" />
          </Link>
        </div>
      </div>
    </header>
  );
}
