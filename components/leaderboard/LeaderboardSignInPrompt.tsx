"use client";

import { motion } from "framer-motion";
import { LogIn, Trophy } from "lucide-react";
import Link from "next/link";

/** Shown when the user is not signed in */
export default function LeaderboardSignInPrompt() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      {/* Animated trophy */}
      <motion.div
        className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-400/10"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Trophy className="h-12 w-12 text-amber-500" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-2"
      >
        <h2 className="text-xl font-extrabold text-theme-primary">
          لوحة المتصدرين
        </h2>
        <p className="mx-auto max-w-[260px] text-sm leading-relaxed text-theme-secondary">
          سجّل دخولك لمشاهدة ترتيبك ومنافسة الآخرين في إتمام العبادات اليومية
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
      >
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-amber-300 active:scale-95"
        >
          <LogIn className="h-4 w-4" />
          <span>تسجيل الدخول</span>
        </Link>
      </motion.div>
    </div>
  );
}
