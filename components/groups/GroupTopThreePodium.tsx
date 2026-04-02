"use client";

import { motion } from "framer-motion";
import { Crown, Medal, Percent, Flame } from "lucide-react";
import type { GroupLeaderboardEntry } from "@/services/api";

// ─── Types ───────────────────────────────────────────────────────

interface GroupTopThreePodiumProps {
  entries: GroupLeaderboardEntry[];
  currentUserUid: string | null;
}

interface PodiumCardProps {
  entry: GroupLeaderboardEntry;
  isCurrentUser: boolean;
  position: 1 | 2 | 3;
}

// ─── Config ──────────────────────────────────────────────────────

const POSITION_CONFIG = {
  1: {
    order: "order-2",
    size: "h-14 w-14",
    ringColor: "ring-amber-400",
    iconBg: "bg-amber-400",
    icon: Crown,
    iconColor: "text-amber-950",
    barHeight: "h-16",
    barGradient: "from-amber-400/30 to-amber-400/10",
    animDelay: 0.1,
    scale: "scale-105",
  },
  2: {
    order: "order-1",
    size: "h-11 w-11",
    ringColor: "ring-slate-400",
    iconBg: "bg-slate-400",
    icon: Medal,
    iconColor: "text-slate-900",
    barHeight: "h-10",
    barGradient: "from-slate-400/25 to-slate-400/10",
    animDelay: 0.2,
    scale: "",
  },
  3: {
    order: "order-3",
    size: "h-11 w-11",
    ringColor: "ring-orange-400",
    iconBg: "bg-orange-400",
    icon: Medal,
    iconColor: "text-orange-900",
    barHeight: "h-7",
    barGradient: "from-orange-400/20 to-orange-400/10",
    animDelay: 0.3,
    scale: "",
  },
} as const;

// ─── PodiumCard ───────────────────────────────────────────────────

function PodiumCard({ entry, isCurrentUser, position }: PodiumCardProps) {
  const cfg = POSITION_CONFIG[position];
  const Icon = cfg.icon;

  return (
    <motion.div
      className={`flex flex-1 flex-col items-center gap-1.5 ${cfg.order} ${cfg.scale}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: cfg.animDelay, type: "spring", stiffness: 140 }}
    >
      {/* Avatar */}
      <div className="relative">
        {entry.photoURL ? (
          <img
            src={entry.photoURL}
            alt={entry.displayName}
            referrerPolicy="no-referrer"
            className={`${cfg.size} rounded-full ring-2 ${cfg.ringColor} object-cover`}
          />
        ) : (
          <div
            className={`${cfg.size} flex items-center justify-center rounded-full bg-theme-subtle ring-2 ${cfg.ringColor}`}
          >
            <span className="text-sm font-bold text-theme-secondary">
              {entry.displayName.charAt(0)}
            </span>
          </div>
        )}
        <div
          className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full ${cfg.iconBg}`}
        >
          <Icon className={`h-3 w-3 ${cfg.iconColor}`} />
        </div>
      </div>

      {/* Name */}
      <p
        className={`max-w-[72px] truncate text-center text-[11px] font-semibold ${
          isCurrentUser ? "text-amber-500" : "text-theme-primary"
        }`}
      >
        {isCurrentUser ? "أنت" : entry.displayName}
      </p>

      {/* Completion rate */}
      <div className="flex items-center gap-0.5">
        <Percent className="h-2.5 w-2.5 text-emerald-400" />
        <span className="text-[10px] font-bold text-emerald-500">
          {entry.completionRate}%
        </span>
      </div>

      {/* Podium bar */}
      <div
        className={`${cfg.barHeight} w-full rounded-t-lg bg-gradient-to-b ${cfg.barGradient} flex items-start justify-center pt-1.5`}
      >
        <span className="text-sm font-extrabold text-theme-secondary/50">
          {position}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────

export default function GroupTopThreePodium({
  entries,
  currentUserUid,
}: GroupTopThreePodiumProps) {
  const top3 = entries.slice(0, 3);
  if (top3.length < 2) return null;

  // Render order: 2nd, 1st, 3rd for podium visual
  const renderOrder = [1, 0, 2] as const;

  return (
    <div className="flex items-end justify-center gap-3 px-4 pt-4 pb-0">
      {renderOrder.map((idx) => {
        const entry = top3[idx];
        if (!entry) return null;
        const position = (idx + 1) as 1 | 2 | 3;
        return (
          <PodiumCard
            key={entry.uid}
            entry={entry}
            isCurrentUser={entry.uid === currentUserUid}
            position={position}
          />
        );
      })}
    </div>
  );
}
