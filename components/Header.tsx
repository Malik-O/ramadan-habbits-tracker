"use client";

import { useAuth } from "@/hooks/useAuth";
import { Sparkles, User } from "lucide-react";
import Link from "next/link";
import ProgressRing from "./ProgressRing";
import StreakBadge from "./StreakBadge";

interface HeaderProps {
  progress: number;
  streak: number;
  completedHabits: number;
  totalHabits: number;
}

export default function Header({
  progress,
  streak,
  completedHabits,
  totalHabits,
}: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-header backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Progress ring */}
        <ProgressRing progress={progress} />

        {/* Habit count */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-theme-primary">
            إنجاز اليوم
          </span>
          <span className="text-xs font-semibold text-theme-secondary mt-0.5">
            {completedHabits}/{totalHabits}
          </span>
        </div>

        {/* Streak + Profile */}
        <div className="flex items-center gap-2">
          <StreakBadge streak={streak} />
          <Link
            href="/profile"
            className="group flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-theme-subtle transition-all hover:bg-theme-border hover:ring-2 hover:ring-amber-500/20"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
            ) : (
              <User className="h-4 w-4 text-theme-secondary transition-colors group-hover:text-theme-primary" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
