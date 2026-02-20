"use client";

import { motion } from "framer-motion";
import { Crown, Medal, Flame, Star } from "lucide-react";
import type { LeaderboardEntry } from "@/services/api";

// ─── Types ───────────────────────────────────────────────────────

interface TopThreePodiumProps {
  entries: LeaderboardEntry[];
  currentUserUid: string | null;
}

interface PodiumCardProps {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  position: "first" | "second" | "third";
}

// ─── Constants ───────────────────────────────────────────────────

const POSITION_CONFIG = {
  first: {
    order: "order-2",
    size: "h-20 w-20",
    ringColor: "ring-amber-400",
    bgGradient: "from-amber-400/20 via-amber-400/5 to-transparent",
    iconBg: "bg-amber-400",
    icon: Crown,
    iconColor: "text-amber-950",
    barHeight: "h-24",
    barGradient: "from-amber-400/30 to-amber-400/10",
    animDelay: 0.1,
  },
  second: {
    order: "order-1",
    size: "h-16 w-16",
    ringColor: "ring-slate-400",
    bgGradient: "from-slate-400/15 via-slate-400/5 to-transparent",
    iconBg: "bg-slate-400",
    icon: Medal,
    iconColor: "text-slate-900",
    barHeight: "h-16",
    barGradient: "from-slate-400/25 to-slate-400/10",
    animDelay: 0.2,
  },
  third: {
    order: "order-3",
    size: "h-16 w-16",
    ringColor: "ring-orange-400",
    bgGradient: "from-orange-400/15 via-orange-400/5 to-transparent",
    iconBg: "bg-orange-400",
    icon: Medal,
    iconColor: "text-orange-900",
    barHeight: "h-12",
    barGradient: "from-orange-400/20 to-orange-400/10",
    animDelay: 0.3,
  },
} as const;

// ─── Components ──────────────────────────────────────────────────

function PodiumCard({ entry, isCurrentUser, position }: PodiumCardProps) {
  const config = POSITION_CONFIG[position];
  const Icon = config.icon;

  return (
    <motion.div
      className={`flex flex-1 flex-col items-center gap-2 ${config.order}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: config.animDelay, type: "spring", stiffness: 120 }}
    >
      {/* Avatar */}
      <div className="relative">
        {entry.photoURL ? (
          <img
            src={entry.photoURL}
            alt={entry.displayName}
            referrerPolicy="no-referrer"
            className={`${config.size} rounded-full ring-2 ${config.ringColor} object-cover`}
          />
        ) : (
          <div
            className={`${config.size} flex items-center justify-center rounded-full bg-gradient-to-br ${config.bgGradient} ring-2 ${config.ringColor}`}
          >
            <span className="text-lg font-bold text-theme-secondary">
              {entry.displayName.charAt(0)}
            </span>
          </div>
        )}
        {/* Rank badge */}
        <div
          className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full ${config.iconBg}`}
        >
          <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} />
        </div>
      </div>

      {/* Name */}
      <p
        className={`max-w-[80px] truncate text-xs font-semibold ${
          isCurrentUser ? "text-amber-500" : "text-theme-primary"
        }`}
      >
        {entry.displayName}
      </p>

      {/* XP */}
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 text-amber-400" />
        <span className="text-xs font-bold text-amber-500">
          {entry.totalXp.toLocaleString()}
        </span>
      </div>

      {/* Streak */}
      {entry.streak > 0 && (
        <div className="flex items-center gap-1 rounded-full bg-orange-400/10 px-2 py-0.5">
          <Flame className="h-3 w-3 text-orange-500" />
          <span className="text-[10px] font-medium text-orange-500">
            {entry.streak}
          </span>
        </div>
      )}

      {/* Podium bar */}
      <div
        className={`${config.barHeight} w-full rounded-t-xl bg-gradient-to-b ${config.barGradient} mt-1 flex items-start justify-center pt-2`}
      >
        <span className="text-lg font-extrabold text-theme-secondary/60">
          {entry.rank}
        </span>
      </div>
    </motion.div>
  );
}

export default function TopThreePodium({
  entries,
  currentUserUid,
}: TopThreePodiumProps) {
  if (entries.length === 0) return null;

  const positions = ["first", "second", "third"] as const;

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card p-4 pb-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-end justify-center gap-2">
        {/* Show in order: 2nd, 1st, 3rd for podium layout */}
        {[1, 0, 2].map((index) => {
          const entry = entries[index];
          if (!entry) return null;
          return (
            <PodiumCard
              key={entry.uid}
              entry={entry}
              isCurrentUser={entry.uid === currentUserUid}
              position={positions[index]}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
