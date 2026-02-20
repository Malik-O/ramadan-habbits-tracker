"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

/** Shown when the leaderboard has no entries */
export default function LeaderboardEmpty() {
  return (
    <motion.div
      className="flex flex-col items-center gap-4 rounded-2xl border border-theme-border bg-theme-card p-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-theme-subtle">
        <Trophy className="h-8 w-8 text-theme-secondary" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-theme-primary">
          لا توجد بيانات بعد
        </h3>
        <p className="mt-1 text-xs text-theme-secondary">
          ابدأ بإتمام عباداتك اليومية لتظهر في لوحة المتصدرين
        </p>
      </div>
    </motion.div>
  );
}
