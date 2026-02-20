"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, Crown, Medal } from "lucide-react";
import type { GroupLeaderboardEntry } from "@/services/api";

interface GroupLeaderboardRowProps {
  entry: GroupLeaderboardEntry;
  isAdmin: boolean;
  onClick: () => void;
}

/** Medal config for top 3 */
const RANK_CONFIG: Record<number, { icon: typeof Crown; bg: string; color: string }> = {
  1: { icon: Crown, bg: "bg-amber-400", color: "text-amber-950" },
  2: { icon: Medal, bg: "bg-slate-400", color: "text-slate-900" },
  3: { icon: Medal, bg: "bg-orange-400", color: "text-orange-900" },
};

export default function GroupLeaderboardRow({
  entry,
  isAdmin,
  onClick,
}: GroupLeaderboardRowProps) {
  const rankCfg = RANK_CONFIG[entry.rank];

  return (
    <motion.button
      onClick={onClick}
      disabled={!isAdmin}
      className={`flex w-full items-center gap-3 px-4 py-3 text-right transition-colors ${
        isAdmin ? "cursor-pointer hover:bg-theme-subtle/50" : "cursor-default"
      }`}
      whileTap={isAdmin ? { scale: 0.99 } : undefined}
    >
      {/* Rank */}
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center">
        {rankCfg ? (
          <div className={`flex h-6 w-6 items-center justify-center rounded-full ${rankCfg.bg}`}>
            <rankCfg.icon className={`h-3.5 w-3.5 ${rankCfg.color}`} />
          </div>
        ) : (
          <span className="text-xs font-bold text-theme-secondary">
            {entry.rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-500/10">
        {entry.photoURL ? (
          <Image
            src={entry.photoURL}
            alt={entry.displayName}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-bold text-amber-500">
            {entry.displayName.charAt(0)}
          </span>
        )}
      </div>

      {/* Name */}
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold text-theme-primary">
          {entry.displayName}
        </span>

        {/* Completion bar */}
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-theme-subtle">
            <motion.div
              className={`h-full rounded-full ${
                entry.completionRate >= 80
                  ? "bg-emerald-500"
                  : entry.completionRate >= 50
                    ? "bg-amber-500"
                    : "bg-theme-secondary"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${entry.completionRate}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="text-[11px] font-bold tabular-nums text-theme-secondary">
            {entry.completionRate}%
          </span>
        </div>
      </div>

      {/* Admin detail arrow */}
      {isAdmin && (
        <ChevronLeft className="h-3.5 w-3.5 flex-shrink-0 text-theme-secondary/50" />
      )}
    </motion.button>
  );
}
