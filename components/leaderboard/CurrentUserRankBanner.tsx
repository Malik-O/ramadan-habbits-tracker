"use client";

import { motion } from "framer-motion";
import { Star, Trophy } from "lucide-react";

interface CurrentUserRankBannerProps {
  rank: number;
  totalCount: number;
}

export default function CurrentUserRankBanner({
  rank,
  totalCount,
}: CurrentUserRankBannerProps) {
  const percentile = totalCount > 0 ? Math.round(((totalCount - rank + 1) / totalCount) * 100) : 0;

  return (
    <motion.div
      className="flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-gradient-to-l from-amber-400/10 via-amber-400/5 to-transparent p-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400/15">
        <Trophy className="h-5 w-5 text-amber-500" />
      </div>

      <div className="flex-1">
        <p className="text-sm font-bold text-theme-primary">
          ترتيبك: <span className="text-amber-500">#{rank}</span>
        </p>
        <p className="mt-0.5 text-[11px] text-theme-secondary">
          أنت ضمن أفضل {percentile}% من {totalCount} مستخدم
        </p>
      </div>

      <div className="flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1.5">
        <Star className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-xs font-bold text-amber-500">#{rank}</span>
      </div>
    </motion.div>
  );
}
