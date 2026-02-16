"use client";

import { motion } from "framer-motion";

interface DailyHeatmapProps {
  dailyCompletions: number[]; // 0-1 for each of 30 days
}

function getHeatColor(value: number): string {
  if (value === 0) return "bg-theme-subtle";
  if (value < 0.25) return "bg-emerald-500/20";
  if (value < 0.5) return "bg-emerald-500/40";
  if (value < 0.75) return "bg-emerald-500/60";
  if (value < 1) return "bg-emerald-500/80";
  return "bg-emerald-500";
}

export default function DailyHeatmap({ dailyCompletions }: DailyHeatmapProps) {
  return (
    <div className="rounded-2xl border border-theme-border bg-theme-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-theme-primary">
        خريطة الأيام
      </h3>

      {/* Grid of 30 days */}
      <div className="grid grid-cols-10 gap-1.5" dir="ltr">
        {dailyCompletions.map((value, i) => (
          <motion.div
            key={i}
            className={`relative flex aspect-square items-center justify-center rounded-lg ${getHeatColor(
              value
            )} transition-colors`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02, duration: 0.2 }}
            title={`يوم ${i + 1}: ${Math.round(value * 100)}%`}
          >
            <span className="text-[9px] font-medium text-theme-secondary">
              {i + 1}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        <span className="text-[10px] text-theme-secondary">أقل</span>
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded ${getHeatColor(v)}`}
          />
        ))}
        <span className="text-[10px] text-theme-secondary">أكثر</span>
      </div>
    </div>
  );
}
