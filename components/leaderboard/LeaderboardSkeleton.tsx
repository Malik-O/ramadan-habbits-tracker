"use client";

import { motion } from "framer-motion";

/** A pulsing skeleton placeholder for the leaderboard while loading */
export default function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Rank banner skeleton */}
      <div className="flex items-center gap-3 rounded-2xl border border-theme-border bg-theme-card p-4">
        <div className="h-11 w-11 animate-pulse rounded-full bg-theme-subtle" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 animate-pulse rounded bg-theme-subtle" />
          <div className="h-3 w-40 animate-pulse rounded bg-theme-subtle" />
        </div>
      </div>

      {/* Podium skeleton */}
      <motion.div
        className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card p-4 pb-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-end justify-center gap-4">
          {[16, 20, 16].map((size, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2 pb-0">
              <div
                className={`h-${size} w-${size} animate-pulse rounded-full bg-theme-subtle`}
                style={{ height: size * 4, width: size * 4 }}
              />
              <div className="h-3 w-14 animate-pulse rounded bg-theme-subtle" />
              <div className="h-3 w-10 animate-pulse rounded bg-theme-subtle" />
              <div
                className="mt-1 w-full animate-pulse rounded-t-xl bg-theme-subtle"
                style={{ height: index === 1 ? 96 : index === 0 ? 64 : 48 }}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* List skeleton */}
      <div className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card">
        <div className="border-b border-theme-border px-4 py-3">
          <div className="h-4 w-16 animate-pulse rounded bg-theme-subtle" />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 border-b border-theme-border px-4 py-3 last:border-b-0"
          >
            <div className="h-8 w-8 animate-pulse rounded-full bg-theme-subtle" />
            <div className="h-9 w-9 animate-pulse rounded-full bg-theme-subtle" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-24 animate-pulse rounded bg-theme-subtle" />
              <div className="h-2.5 w-16 animate-pulse rounded bg-theme-subtle" />
            </div>
            <div className="h-6 w-14 animate-pulse rounded-full bg-theme-subtle" />
          </div>
        ))}
      </div>
    </div>
  );
}
