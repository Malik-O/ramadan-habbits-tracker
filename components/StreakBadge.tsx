"use client";

import { Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-1.5"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        key={streak}
      >
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.4 }}
        >
          <Flame className="h-4 w-4 text-orange-400" />
        </motion.div>
        <span className="text-sm font-bold text-orange-300">{streak}</span>
      </motion.div>
    </AnimatePresence>
  );
}
