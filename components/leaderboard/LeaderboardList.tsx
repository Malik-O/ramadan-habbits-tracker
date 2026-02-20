"use client";

import { motion } from "framer-motion";
import { Star, Flame, ChevronDown, Loader2 } from "lucide-react";
import type { LeaderboardEntry } from "@/services/api";

// ─── Types ───────────────────────────────────────────────────────

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  currentUserUid: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  index: number;
  isCurrentUser: boolean;
}

// ─── Components ──────────────────────────────────────────────────

function LeaderboardRow({ entry, index, isCurrentUser }: LeaderboardRowProps) {
  return (
    <motion.div
      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
        isCurrentUser
          ? "bg-amber-400/5 border-r-2 border-amber-400"
          : "hover:bg-theme-subtle/50"
      }`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5) }}
    >
      {/* Rank */}
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-theme-subtle text-xs font-bold text-theme-secondary">
        {entry.rank}
      </span>

      {/* Avatar */}
      {entry.photoURL ? (
        <img
          src={entry.photoURL}
          alt={entry.displayName}
          referrerPolicy="no-referrer"
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-theme-subtle">
          <span className="text-sm font-semibold text-theme-secondary">
            {entry.displayName.charAt(0)}
          </span>
        </div>
      )}

      {/* Name + Streak */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${
            isCurrentUser ? "text-amber-500" : "text-theme-primary"
          }`}
        >
          {entry.displayName}
          {isCurrentUser && (
            <span className="mr-1 text-[10px] text-amber-400"> (أنت)</span>
          )}
        </p>
        {entry.streak > 0 && (
          <div className="mt-0.5 flex items-center gap-1">
            <Flame className="h-3 w-3 text-orange-500" />
            <span className="text-[10px] text-orange-400">
              {entry.streak} يوم متتالي
            </span>
          </div>
        )}
      </div>

      {/* XP */}
      <div className="flex items-center gap-1 rounded-full bg-amber-400/10 px-2.5 py-1">
        <Star className="h-3 w-3 text-amber-400" />
        <span className="text-xs font-bold text-amber-500">
          {entry.totalXp.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}

export default function LeaderboardList({
  entries,
  currentUserUid,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: LeaderboardListProps) {
  // Skip top 3 (already shown in podium)
  const listEntries = entries.filter((e) => e.rank > 3);

  if (listEntries.length === 0 && !hasMore) return null;

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between border-b border-theme-border px-4 py-3">
        <h3 className="text-sm font-semibold text-theme-primary">الترتيب</h3>
        <span className="rounded-full bg-theme-subtle px-2.5 py-0.5 text-[10px] font-medium text-theme-secondary">
          #{listEntries[0]?.rank || 4}+
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-theme-border">
        {listEntries.map((entry, index) => (
          <LeaderboardRow
            key={entry.uid}
            entry={entry}
            index={index}
            isCurrentUser={entry.uid === currentUserUid}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="flex w-full items-center justify-center gap-2 border-t border-theme-border py-3 text-sm font-medium text-theme-secondary transition-colors hover:bg-theme-subtle hover:text-theme-primary disabled:opacity-50"
        >
          {isLoadingMore ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span>عرض المزيد</span>
            </>
          )}
        </button>
      )}
    </motion.div>
  );
}
