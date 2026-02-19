"use client";

import { motion } from "framer-motion";
import { Moon as MoonIcon } from "lucide-react";
import { RAMADAN_YEAR } from "@/constants/habits";

export default function AppInfoCard() {
  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
          <MoonIcon className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-theme-primary">
            همة
          </h2>
          <p className="text-xs text-theme-secondary">{RAMADAN_YEAR}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-theme-secondary">
        <span className="font-bold text-theme-primary">رفيقك لطاعةٍ تدوم. </span>
        تتبع عباداتك اليومية في رمضان، نافس نفسك، وارتقِ بمستواك!
      </p>
    </motion.div>
  );
}
